<script>

export default {
  name: 'user-avatar',
  props: {
    size: {
      type: Number,
      default: 20,
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
      isGameMode: true,
    };
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    fontSize() {
      const calcSize = parseInt(this.size * 0.35);
      if (calcSize <= 10) {
        return 10;
      }
      return calcSize;
    },
    numberOfhearts() {
      return this.user.hearts;
    },
    numberOfXpFilled() {
      if (this.user.settings.experience === 0) {
        return 0;
      }
      if (this.user.settings.experience === 10) {
        return 1;
      }
      if (this.user.settings.experience === 20) {
        return 2;
      }
      if (this.user.settings.experience === 30) {
        return 3;
      }
      if (this.user.settings.experience === 40) {
        return 4;
      }
      return 0;
    },
    xpSrcFile() {
      return `@/assets/img/xp-bar-${this.numberOfXpFilled}.png`;
    },
  },
};
</script>
<template>
  <div
    class="GameBar-bar-container"
    :style="{ width: `${size}px`, height: `${size}px` }"
    v-if="isGameMode">
    <img
      class="GameBar-hearts"
      alt="hearts"
      src="@/assets/img/hearts-3.png"
      :style="{ width: `50px`, height: `20px` }" />

    <!-- XP-BAR -->
    <img
      v-if="user.settings.experience === 0"
      class="GameBar-xpbar"
      alt="xpbar"
      src="@/assets/img/xp-bar-0.png"
      :style="{ width: `80px`, height: `20px` }" />
    <img
      v-if="user.settings.experience === 10"
      class="GameBar-xpbar"
      alt="xpbar"
      src="@/assets/img/xp-bar-1.png"
      :style="{ width: `80px`, height: `20px` }" />
    <img
      v-if="user.settings.experience === 20"
      class="GameBar-xpbar"
      alt="xpbar"
      src="@/assets/img/xp-bar-2.png"
      :style="{ width: `80px`, height: `20px` }" />
    <img
      v-if="user.settings.experience === 30"
      class="GameBar-xpbar"
      alt="xpbar"
      src="@/assets/img/xp-bar-3.png"
      :style="{ width: `80px`, height: `20px` }" />
    <img
      v-if="user.settings.experience === 40"
      class="GameBar-xpbar"
      alt="xpbar"
      src="@/assets/img/xp-bar-4.png"
      :style="{ width: `80px`, height: `20px` }" />

    <!-- CATALOGER LVL -->
    <img
      v-if="user.settings.level === 1"
      class="GameBar-lvl"
      alt="level"
      src="@/assets/img/lvl1-cat.png"
      :style="{ width: `140px`, height: `20px` }" />
    <img
      v-if="user.settings.level === 2"
      class="GameBar-lvl"
      alt="level"
      src="@/assets/img/lvl2-cat.png"
      :style="{ width: `140px`, height: `20px` }" />
    <img
      v-if="user.settings.level === 3"
      class="GameBar-lvl"
      alt="level"
      src="@/assets/img/lvl3-cat.png"
      :style="{ width: `140px`, height: `20px` }" />

    <!-- SWORD -->
    <img
      v-if="user.settings.level === 1"
      class="GameBar-sword"
      alt="sword"
      src="@/assets/img/lvl1-sword.png"
      :style="{ width: `30px`, height: `30px` }" />
    <img
      v-if="user.settings.level === 2"
      class="GameBar-sword"
      alt="sword"
      src="@/assets/img/lvl2-sword.png"
      :style="{ width: `30px`, height: `30px` }" />

  </div>
</template>

<style lang="less">
.GameBar {
  &-bar-container {
    display: grid;
    grid-template-columns: 50px 80px 140px 30px;
    gap: 0px 10px;
    align-items: center;
    grid-template-areas:
      "hearts xpbar lvl sword"
  }
  &-xpbar {
    grid-area: xpbar;
    //padding-right: 10px;
  }
  &-hearts {
    grid-area: hearts;
    //padding-right: 5px;
  }
  &-lvl {
    grid-area: lvl;
  }
  &-sword {
    grid-area: sword;
  }
}

</style>
