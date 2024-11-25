<script>

export default {
  name: 'user-avatar',
  props: {
    size: {
      type: Number,
      default: 32,
    },
    appearance: {
      type: String,
      default: 'light',
    },
    highlight: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      hasAvatar: true,
    };
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    initials() {
      let initials = '';
      const splitName = this.user.fullName.split(' ');
      for (let i = 0; i < splitName.length; i++) {
        splitName[i] = splitName[i].substr(0, 1);
      }
      if (splitName.length > 2) {
        initials = splitName[0];
      } else {
        initials = splitName.join('');
      }
      return initials;
    },
    fontSize() {
      const calcSize = parseInt(this.size * 0.35);
      if (calcSize <= 10) {
        return 10;
      }
      return calcSize;
    },
  },
};
</script>
<template>
  <div
    class="UserAvatar"
    :class="[this.appearance]"
    :style="{ width: `${size}px`, height: `${size}px` }">
    <img
      v-if="hasAvatar"
      class="UserAvatar-gravatar"
      alt="Avatar"
      :style="{ width: `${size}px`, height: `${size}px` }"
      :src="`https://www.gravatar.com/avatar/${user.emailHash}?d=404&s=${size * 2}`"
      @error="hasAvatar = false" />
    <span
      v-if="!hasAvatar"
      class="UserAvatar-no-gravatar"
      :class="{ highlight: this.highlight }"
      :style="{ fontSize: `${fontSize}pt` }">
      {{ initials }}
    </span>
  </div>
</template>

<style lang="less">
.UserAvatar {
  overflow: hidden;
  display: inline-flex;
  vertical-align: middle;
  flex-direction: column;
  align-items: center;
  border-radius: 50%;
  border: 1px solid @grey-light;

  @media screen and (min-width: @screen-md) {
    margin-right: 4px;
  }

  &.dark {
    border-color: @grey-dark;
  }

  &-no-gravatar {
    height: 100%;
    width: 100%;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    text-transform: uppercase;
    border-color: @grey-light;
    color: @grey-light;

    &.highlight {
      color: @white;
      border-color: @white;
    }

    .dark & {
      border-color: @grey-dark;
      color: @grey-dark;
    }
  }
}

</style>
