<template>
  <v-dialog v-model="isShown" hide-overlay transition="dialog-bottom-transition" width="500">
    <v-toolbar color="warning">
      <v-toolbar-title> {{ $t('feedback') }} </v-toolbar-title>
      <v-spacer />
       <v-btn icon dark @click="hide">
        <v-icon>close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-list three-line subheader>
      <v-subheader>{{ $t('feedback.description') }}</v-subheader>
      <v-list-tile avatar>
        <v-list-tile-content>
          <v-list-tile-title> {{ $t('feedback.github') }}</v-list-tile-title>
          <v-list-tile-sub-title> {{ $t('feedback.githubDescription') }} </v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn flat href="https://github.com/Voxelum/x-minecraft-launcher/issues/new">
            {{ $t('feedback.githubOpenIssue') }}
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
      <v-list-tile avatar>
        <v-list-tile-content>
          <v-list-tile-title> {{ $t('feedback.qq') }} </v-list-tile-title>
          <v-list-tile-sub-title style="max-width: 80%">
            {{ $t('feedback.qqDescription', { number: 858391850 }) }}
          </v-list-tile-sub-title>
        </v-list-tile-content>

        <v-list-tile-action>
          <v-btn flat href="https://jq.qq.com/?_wv=1027&k=5Py5zM1">
            {{ $t('feedback.qqEnterGroup') }}
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
  </v-dialog>
</template>

<script lang=ts>
import { reactive, toRefs, defineComponent } from '@vue/composition-api';
import { useDialog } from '../hooks';

export default defineComponent({
  setup() {
    const data = reactive({
      hovered: {},
    });
    const { hide, isShown } = useDialog('feedback');
    return {
      ...toRefs(data),
      hide,
      isShown,
    };
  },
});
</script>

<style>
.diff {
  color: #81c784;
  font-style: italic;
}
</style>
