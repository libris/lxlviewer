<script>
import * as HttpUtil from '@/utils/http';
import { getHandleAction } from "../../utils/record";
import { getLibraryUri } from "lxljs/string";
import { mapGetters } from "vuex";
import { translatePhrase } from "../../utils/filters";
import RoundedButton from "../shared/rounded-button.vue";

export default {
  name: "handled-button",
  components: { RoundedButton },
  props: {
    focusData: {},
    recordId: {}
  },
  data() {
    return {
      linkedAdminNotices: {},
      isChecked: false,
      removed: false
    }
  },
  methods: {
    translatePhrase() {
      return translatePhrase
    },
    async setHandledOrUnhandled() {
      // Set handled
      if (!this.isHandledByCurrentSigel) {
        const handleActionRecord = getHandleAction(this.recordId, getLibraryUri(this.user.settings.activeSigel));
        const response = await HttpUtil.post({
          url: `${this.settings.apiPath}/data`,
          token: this.user.token,
          activeSigel: this.user.settings.activeSigel,
        }, handleActionRecord);
        const recordUrl = `${response.getResponseHeader('Location')}`;
        this.linkedAdminNotices[this.user.settings.activeSigel] = recordUrl;
        this.removed = false;
      } else {
        // Set unhandled
        this.removeHandleActionForCurrentSigel();
      }
    },
    removeHandleActionForCurrentSigel() {
      let uri = '';
      uri = typeof this.handleAction !== 'undefined'  ? this.handleAction['@id'] : this.linkedAdminNotices[this.user.settings.activeSigel];
      if (uri !== '') {
        const id = uri.split('/').pop().replace('#it', '');
        const url = `${this.settings.apiPath}/${id}`;
        HttpUtil._delete({ url, activeSigel: this.user.settings.activeSigel, token: this.user.token }).then(() => {
          delete this.linkedAdminNotices[this.user.settings.activeSigel];
          this.removed = true;
        });
      }
    }
  },
  computed: {
    ...mapGetters([
      'user',
      'settings'
    ]),
    handleAction() {
      return this.focusData['@reverse']?.concerning.find((c) => c.agent ? c.agent['@id'] === getLibraryUri(this.user.settings.activeSigel) : false);
    },
    isHandledByCurrentSigel() {
      return (this.hasReverseConcerning || this.linkedAdminNotices[this.user.settings.activeSigel]) && !this.removed;
    },
    hasReverseConcerning() {
      return this.focusData['@reverse']?.concerning.some((c) => c.agent ? c.agent['@id'] === getLibraryUri(this.user.settings.activeSigel) : false);
    },
    label() {
      if (this.isHandledByCurrentSigel) {
        return `${translatePhrase('Handled')} (${this.user.settings.activeSigel})`;
      }
      return `${translatePhrase('Not handled')} (${this.user.settings.activeSigel})`;
    },
    tooltipText() {
      if (this.isHandledByCurrentSigel) {
        return `${translatePhrase('Unmark as handled for')} ${this.user.settings.activeSigel}`;
      }
      return `${translatePhrase('Mark as handled for')} ${this.user.settings.activeSigel}`;
    },
  },
}
</script>

<template>
  <div class="HandledButton-container">
    <span class="HandledButton-label uppercaseHeading--light"> {{ label }} </span>

  <rounded-button
    v-tooltip.top="tooltipText"
    :icon="isHandledByCurrentSigel ? 'check' : ''"
    :indicator="isHandledByCurrentSigel"
    :label="isHandledByCurrentSigel
          ? `${translatePhrase('Unmark as handled for')} ${user.settings.activeSigel}`
          : `${translatePhrase('Mark as handled for')} ${user.settings.activeSigel}`"
    @click="setHandledOrUnhandled"
    @keyup.enter="setHandledOrUnhandled"
  />
  </div>
</template>

<style scoped lang="less">
.HandledButton {
  &-label {
    margin-right: 5px;
  }

  &-container {
    display: flex;
    align-items: center;
  }
}
</style>
