<template>
  <v-dialog
    :value="instance.path"
    width="400"
    persistent
  >
    <v-card>
      <v-card-title>
        <h2>{{ $t('profile.delete') }}</h2>
      </v-card-title>
      <v-card-text>
        <span
          style="overflow: hidden; word-break: break-all;"
        >{{ $t('profile.deleteHint', { name: instance.name, id: instance.path }) }}</span>
      </v-card-text>
      <v-card-actions>
        <v-btn
          flat
          @click="cancel"
        >{{ $t('cancel') }}</v-btn>
        <v-spacer />
        <v-btn
          flat
          color="red"
          @click="confirm"
        >
          <v-icon left>delete</v-icon>
          {{ $t('yes') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang=ts>
import { defineComponent } from '@vue/composition-api';

export interface Props {
  instance?: { id: string; name: string };
  confirm: () => void;
  cancel: () => void;
}

export default defineComponent<Props>({
  props: {
    instance: Object,
    confirm: Function,
    cancel: Function,
  },
});
</script>

<style>
</style>
