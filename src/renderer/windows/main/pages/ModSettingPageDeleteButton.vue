<template>
  <v-fab-transition>
    <v-btn
      v-if="visible"
      style="right: 40vw; bottom: 10px;"
      large
      absolute
      dark
      fab
      bottom
      color="red"
      @dragover.prevent
      @drop="drop"
    >
      <v-icon>delete</v-icon>
    </v-btn>
  </v-fab-transition>
</template>

<script lang=ts>
import { defineComponent } from '@vue/composition-api';

export interface Props {
  visible: boolean;
  drop: (dropEvent: DragEvent) => void;
}

export default defineComponent<Props>({
  props: {
    visible: Boolean,
    drop: Function,
  },
});
</script>
