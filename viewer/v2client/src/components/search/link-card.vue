<script>
export default {
  name: 'link-card',
  props: [
    "videoUrl",
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
  <div class="panel panel-default LinkCard" v-bind:class="{'no-link': !linkUrl, 'LinkCard--large': videoUrl}">
    <img v-if="image" :src="resolvedImage" class="LinkCard-img"/>

    <div v-else-if="videoUrl" class="LinkCard-videoWrap">
      <div class="LinkCard-video Video">
        <iframe :src="videoUrl" frameborder="0" allowfullscreen></iframe>
      </div>
    </div> 
     
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
.LinkCard {
  flex-basis: 24%; // To parent
  display: flex;
  min-width: 200px;
  flex-direction: column;
  align-items: center;
  padding: 0;

  @media (min-width: 992px) {
      flex-basis: 24%; 
    }

  &-img {
    width: 100%;
    flex-shrink: 0; // Prevent weird image sizing behaviour in IE11
  }

  &-videoWrap {
    flex-basis: 45%;
    padding-bottom: 1px;
  }

  &-video {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 */
    padding-top: 25px;
    height: 0;
  
    &-iframe,
    & iframe,
    & embed {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  &-content {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.5em 1em 0em 1em;
    flex-grow: 1;
    width: 100%;

    .LinkCard--large & {
      padding: 1em;
      flex-basis: 45%;
    }
  }

  &-link {
    padding: 10px 0;
  }

  &-text {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  &-title {
    display: block;
    font-size: 20px;
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 10px 0;
  }

  &.no-link {
    padding-bottom: 1em;
  }

  &--large {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: inherit;
  }
}
</style>
