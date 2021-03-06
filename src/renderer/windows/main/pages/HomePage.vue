<template>
  <v-layout
    row
    wrap
  >
    <v-icon
      v-ripple
      style="position: absolute; right: 0; top: 0; z-index: 2; margin: 0; padding: 10px; cursor: pointer; border-radius: 2px; user-select: none;"
      dark
      @click="quit"
    >close</v-icon>
    <v-icon
      v-ripple
      style="position: absolute; right: 44px; top: 0; z-index: 2; margin: 0; padding: 10px; cursor: pointer; border-radius: 2px; user-select: none;"
      dark
      @click="showFeedbackDialog"
    >help_outline</v-icon>

    <v-flex
      d-flex
      xs12
      style="z-index: 1; padding-top: 50px; padding-left: 50px"
    >
      <home-header />
    </v-flex>

    <v-flex
      v-if="isServer"
      d-flex
      xs12
      style="margin: 40px;"
    >
      <server-status-bar />
    </v-flex>

    <!-- <div style="position: absolute; left: 20px; bottom: 10px"> -->
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn
          style="position: absolute; left: 20px; bottom: 10px; "
          flat
          icon
          dark
          to="/base-setting"
          v-on="on"
        >
          <v-icon dark>more_vert</v-icon>
        </v-btn>
      </template>
      {{ $t('profile.setting') }}
    </v-tooltip>

    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn
          style="position: absolute; left: 80px; bottom: 10px; "
          flat
          icon
          dark
          :loading="refreshing"
          v-on="on"
          @click="showExportDialog"
        >
          <v-icon dark>share</v-icon>
        </v-btn>
      </template>
      {{ $t('profile.modpack.export') }}
    </v-tooltip>

    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn
          style="position: absolute; left: 140px; bottom: 10px; "
          flat
          icon
          dark
          v-on="on"
          @click="showLogDialog"
        >
          <v-icon dark>subtitles</v-icon>
        </v-btn>
      </template>
      {{ $t('profile.logsCrashes.title') }}
    </v-tooltip>
    <!-- </div> -->

    <problems-bar />

    <!-- <v-speed-dial
      class="launch-speed-dial"
      direction="top"
      :disabled="refreshing || missingJava || launchStatus !== 'ready'"
      :open-on-hover="false"
    >
      <template v-slot:activator>
        <v-btn
          dark
          large
          class="launch-side-button"
          color="primary"
          :disabled="refreshing || missingJava || launchStatus !== 'ready'"
          v-on="on"
        >
          <v-icon>expand_less</v-icon>
        </v-btn>
      </template>
      <v-btn
        dark
        color="orange"
        :disabled="refreshing || missingJava || launchStatus !== 'ready'"
        @click="selectLaunchTarget(false)"
      >
        <v-flex xs3>
          <v-icon left>check</v-icon>
        </v-flex>
        <v-divider vertical />
        <v-flex>{{ $t('launch.client') }}</v-flex>
      </v-btn>
      <v-btn
        dark
        color="red"
        :disabled="refreshing || missingJava || launchStatus !== 'ready'"
        @click="selectLaunchTarget(true)"
      >
        <v-flex xs3>
        </v-flex>
        <v-divider vertical />
        <v-flex>{{ $t('launch.localhost') }}</v-flex>
      </v-btn>
    </v-speed-dial> -->

    <v-btn
      color="primary"
      dark
      large
      :disabled="refreshing || missingJava"
      class="launch-button"
      @click="launch"
    >
      {{ $t('launch.launch') }}
      <v-icon
        v-if="launchStatus === 'ready'"
        right
      >play_arrow</v-icon>
      <v-progress-circular
        v-else
        class="v-icon--right"
        indeterminate
        :size="20"
        :width="2"
      />
    </v-btn>
    <log-dialog
      v-model="isLogDialogShown"
      :hide="hideLogDialog"
    />
    <game-exit-dialog />
    <feedback-dialog />
  </v-layout>
</template>

<script lang=ts>
import { defineComponent, onMounted } from '@vue/composition-api';
import { LaunchException } from '@universal/util/exception';
import {
  useI18n,
  useLaunch,
  useNativeDialog,
  useInstance,
  useJava,
  useQuit,
} from '@/hooks';
import { useDialog, useNotifier } from '../hooks';
import GameExitDialog from './HomePageGameExitDialog.vue';
import LaunchBlockedDialog from './HomePageLaunchBlockedDialog.vue';
import FeedbackDialog from './HomePageFeedbackDialog.vue';
import LogDialog from './HomePageLogDialog.vue';
import HomeHeader from './HomePageHeader.vue';
import ProblemsBar from './HomePageProblemsBar.vue';
import ServerStatusBar from './HomePageServerStatusBar.vue';

function setupLaunch() {
  const { launch, status: launchStatus } = useLaunch();
  const { show: showLaunchStatusDialog, hide: hideLaunchStatusDialog } = useDialog('launch-status');
  const { show: showLaunchBlockedDialog } = useDialog('launch-blocked');

  // let launchTarget = useLocalStorageCacheBool('launchTarget', false);
  // function selectLaunchTarget(isServer: boolean) {
  //     launchTarget.value = isServer;
  // }
  // watch([errors, errorType], () => {
  //   if (errors.value.length !== 0 || errorType.value.length !== 0) {
  //     notify('error', `[${errorType.value}] ${errors.value}`);
  //   }
  // });

  return {
    launchStatus,
    hideLaunchStatusDialog,
    // selectLaunchTarget,
    // launchTarget,
    launch() {
      if (launchStatus.value === 'checkingProblems' || launchStatus.value === 'launching' || launchStatus.value === 'launched') {
        showLaunchStatusDialog();
      } else {
        launch().catch((e: LaunchException) => {
          if (e.type === 'launchBlockedIssues') {
            showLaunchBlockedDialog();
          } else if (e.type === 'launchGeneralException') {
            // TODO: support this
          }
        });
      }
    },
  };
}

export default defineComponent({
  components: {
    LaunchBlockedDialog,
    LogDialog,
    ProblemsBar,
    HomeHeader,
    ServerStatusBar,
    GameExitDialog,
    FeedbackDialog,
  },
  setup() {
    const { $t } = useI18n();
    const { showSaveDialog } = useNativeDialog();
    const { isShown: isLogDialogShown, show: showLogDialog, hide: hideLogDialog } = useDialog('log');
    const { show: showFeedbackDialog } = useDialog('feedback');
    const { refreshing, name, isServer, exportInstance: exportTo, refreshServerStatus } = useInstance();
    const { subscribeTask } = useNotifier();
    const { missing: missingJava } = useJava();
    const { quit } = useQuit();

    onMounted(() => {
      if (isServer.value) {
        refreshServerStatus();
      }
    });

    return {
      isServer,
      refreshing,
      missingJava,
      showFeedbackDialog,
      quit,

      ...setupLaunch(),

      showLogDialog,
      isLogDialogShown,
      hideLogDialog,

      async showExportDialog() {
        if (refreshing.value) return;
        const { filePath } = await showSaveDialog({
          title: $t('profile.export.title'),
          filters: [{ name: 'zip', extensions: ['zip'] }],
          message: $t('profile.export.message'),
          defaultPath: `${name.value}.zip`,
        });
        if (filePath) {
          subscribeTask(exportTo({ destinationPath: filePath, mode: 'full' }), $t('profile.export.title'));
        }
      },
    };
  },
});
</script>

<style>
.v-dialog__content--active {
  -webkit-app-region: no-drag;
  user-select: auto;
}
.v-dialog {
  -webkit-app-region: no-drag;
  user-select: auto;
}
.v-badge__badge.primary {
  right: -10px;
  height: 20px;
  width: 20px;
  font-size: 12px;
}

.pointer * {
  cursor: pointer !important;
}

.launch-side-button {
  /* position: absolute !important; */
  /* right: 147px; */
  /* bottom: 10px; */
  border-radius: 2px 0px 0px 2px;
  padding: 0px;
  min-width: 0px;
}

.launch-side-button .v-btn__content {
  min-width: 0px;
}
.launch-side-button i {
  font-size: 22px;
}
.launch-button {
  position: absolute !important;
  border-radius: 0px 2px 2px 0px;
  right: 10px;
  bottom: 10px;
}
.launch-speed-dial {
  right: 147px;
  bottom: 10px;
  position: absolute;
}
.launch-speed-dial .v-speed-dial__list {
  align-items: start;
}
.launch-speed-dial .v-speed-dial__list .v-btn {
  max-width: 159px;
  min-width: 159px;
}
</style>
