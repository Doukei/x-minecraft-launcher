import { app } from 'electron';
import locales from 'static/locales';
import { autoUpdater, UpdaterSignal } from 'electron-updater';
import { Task } from '@xmcl/minecraft-launcher-core';
import base from 'universal/store/modules/setting';
import isInGFW from 'in-gfw';

/**
 * @type {import('universal/store/modules/setting').SettingModule}
 */
const mod = {
    ...base,
    actions: {
        async load(context) {
            const data = await context.dispatch('getPersistence', { path: 'setting.json', schema: 'SettingConfig' }) || {};
            context.commit('config', {
                locale: data.locale || app.getLocale(),
                locales: Object.keys(locales),
                autoInstallOnAppQuit: data.autoInstallOnAppQuit,
                autoDownload: data.autoDownload,
                allowPrerelease: data.allowPrerelease,
                useBmclAPI: data.useBmclAPI,
                defaultBackgroundImage: data.defaultBackgroundImage,
                defaultBlur: data.defaultBlur,
                // settings: data.settings,
            });
        },
        async save(context, { mutation }) {
            switch (mutation) {
                case 'locale':
                case 'allowPrerelease':
                case 'autoInstallOnAppQuit':
                case 'autoDownload':
                case 'defaultBackgroundImage':
                case 'defaultBlur':
                case 'useBmclApi':
                    await context.dispatch('setPersistence', {
                        path: 'setting.json',
                        data: {
                            locale: context.state.locale,
                            autoInstallOnAppQuit: context.state.autoInstallOnAppQuit,
                            autoDownload: context.state.autoDownload,
                            allowPrerelease: context.state.allowPrerelease,
                            useBmclAPI: context.state.useBmclAPI,
                            defaultBackgroundImage: context.state.defaultBackgroundImage,
                            defaultBlur: context.state.defaultBlur,
                        },
                    });
                    break;
                default:
            }
        },

        async quitAndInstall(context) {
            if (context.state.readyToUpdate) {
                autoUpdater.quitAndInstall();
            }
        },

        async checkUpdate({ dispatch, commit }) {
            commit('checkingUpdate', true);
            const task = Task.create('checkUpdate', async (context) => {
                try {
                    const info = await autoUpdater.checkForUpdates();
                    commit('updateInfo', info.updateInfo);
                    return info;
                } catch {
                    return undefined;
                } finally {
                    commit('checkingUpdate', false);
                }
            });
            return dispatch('executeTask', task);
        },

        async downloadUpdate(context) {
            /**
             * @param {Task.Context} ctx 
             */
            function download(ctx) {
                return new Promise((resolve, reject) => {
                    autoUpdater.downloadUpdate().catch(reject);
                    const signal = new UpdaterSignal(autoUpdater);
                    signal.updateDownloaded((info) => {
                        resolve(info);
                    });
                    signal.progress((info) => {
                        ctx.update(info.transferred, info.total);
                    });
                    signal.updateCancelled((info) => {
                        reject(info);
                    });
                    autoUpdater.on('error', (err) => {
                        reject(err);
                    });
                });
            }
            const task = Task.create('downloadUpdate', async (ctx) => {
                if (!context.state.autoDownload) {
                    context.commit('downloadingUpdate', true);
                    const swapDownloadSrc = await isInGFW().catch(_ => false);
                    let oldFeedUrl = '';
                    if (swapDownloadSrc) {
                        oldFeedUrl = autoUpdater.getFeedURL() || '';
                        autoUpdater.setFeedURL('https://voxelauncher.blob.core.windows.net/releases');
                        await autoUpdater.checkForUpdates();
                    }
                    try {
                        let promise = download(ctx);
                        if (swapDownloadSrc) {
                            promise = promise.catch(async (e) => {
                                console.warn('Cannot download update from azure source. Switch to github source!');
                                console.warn(e);
                                autoUpdater.setFeedURL(oldFeedUrl);
                                await autoUpdater.checkForUpdates();
                                return download(ctx);
                            });
                        }
                        await promise;
                        context.commit('readyToUpdate', true);
                    } catch (e) {
                        context.commit('readyToUpdate', false);
                    } finally {
                        context.commit('downloadingUpdate', false);
                    }
                } else {
                    throw 'cancelled';
                }
            });
            return context.dispatch('executeTask', task);
        },
    },
};

export default mod;