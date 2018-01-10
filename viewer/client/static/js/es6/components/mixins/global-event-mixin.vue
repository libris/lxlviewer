<script>
import * as LayoutUtil from '../../utils/layout';
import { getUser } from '../../vuex/getters';
import { updateUser } from '../../vuex/actions';

export default {
  vuex: {
    actions: {
      updateUser,
    },
    getters: {
      user: getUser,
    },
  },
  events: {
    'track-event'(action, name) {
      const category = window.loadHandler.getCurrentView().name;
      window.loadHandler.getCurrentView().trackEvent(category, action, name);
    },
    'show-help': function(value) {
      this.$dispatch('track-event', 'click', 'help');
      LayoutUtil.scrollLock(true);
      this.changeStatus('keybindState', 'help-window');
      this.changeStatus('showHelp', true);
      this.changeStatus('helpSection', value);
    },
    'set-dirty'(b) {
      window.loadHandler.getCurrentView().dirty = b;
    },
  },
};
</script>
