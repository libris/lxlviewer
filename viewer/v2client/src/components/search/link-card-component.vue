<script>

export default {
  name: 'link-card',
  props: [
    "image",
    "linkUrl",
    "linkText",
    "header",
    "text",
  ],
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
  },
  computed: {
    resolvedImage() {
      return require(`@/assets/img/${this.image}`)
    }
  },
  components: {
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>


<template>
  <div class="panel panel-default LinkCard" v-bind:class="{'no-link': !linkUrl}">
    <img :src="getImage" class="LinkCard-img"/>
    <div class="LinkCard-content">
      <div class="LinkCard-text">
        <span class="LinkCard-title">{{ header }}</span>
        <div class="LinkCard-descr">{{ text }}</div>
      </div>
      <a v-if="linkUrl" :href="linkUrl" class="card-link LinkCard-link">{{ linkText }}</a>
    </div>
  </div>
</template>

<style lang="less">
  @import '../../../../less/components/_linkcard.less';
</style>
