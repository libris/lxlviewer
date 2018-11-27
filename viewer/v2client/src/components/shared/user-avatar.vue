<script>

export default {
  name: 'user-avatar',
  props: {
    size: {
      type: Number,
      default: 32,
    },
  },
  data() {
    return {
      hasAvatar: true,
    }
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
      const calcSize = this.size * 0.4;
      if (calcSize <= 12) {
        return 12;
      }
      return calcSize;
    },
  }
}
</script>
<template>
  <div class="UserAvatar" :style="{ width: `${size}px`, height: `${size}px` }">
    <img v-if="hasAvatar" class="UserAvatar-gravatar" @error="hasAvatar = false" :src="`https://www.gravatar.com/avatar/${user.emailHash}?d=404&s=${size}`" alt="Avatar" />
    <span v-if="!hasAvatar" class="UserAvatar-no-gravatar" :style="{ fontSize: `${fontSize}pt` }">
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
  background-color: @brand-primary;

  &-gravatar {
    line-height: 1.8em;
  }
  &-no-gravatar {
    user-select: none;
    text-transform: uppercase;
    color: #fff;
    line-height: 1.8em;
  }
}

</style>
