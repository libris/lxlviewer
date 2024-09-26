<script>
import ServiceWidgetSettings from '@/resources/json/serviceWidgetSettings.json';
import copy from '@/resources/json/copy.json';
import LinkCardComponent from '@/components/search/link-card.vue';

export default {
  name: 'LandingPage',
  data() {
    return {
      copy,
      msg: 'Welcome to Your Vue.js App',
    };
  },
  methods: {
    widgetShouldBeShown(id) {
      const componentList = ServiceWidgetSettings['libris.kb.se'];
      if (!componentList.hasOwnProperty(id)) {
        return false;
      }
      if (
        (componentList[id].hasOwnProperty('forced') && componentList[id].forced === true)
        // TODO: Don't read standard here, read from user settings and init as active in user settings if standard
        || (componentList[id].hasOwnProperty('standard') && componentList[id].standard)
      ) {
        return true;
      }
      return false;
    },
  },
  components: {
    'link-card': LinkCardComponent,
  },
};
</script>

<template>
  <div class="row">
    <div class="LandingPage col-md-12">
      <div class="LandingPage-linkCards">
        <link-card
          v-if="widgetShouldBeShown('about-xl')"
          :image="copy['about-xl'].image"
          :image-alt-text="copy['about-xl'].image_alt_text"
          :header="copy['about-xl'].header"
          :text="copy['about-xl'].text"
          :link-text="copy['about-xl'].linkText"
          :link-url="copy['about-xl'].linkUrl" />
        <link-card
          v-if="widgetShouldBeShown('link-blog')"
          :image="copy['blog'].image"
          :image-alt-text="copy['blog'].image_alt_text"
          :header="copy['blog'].header"
          :text="copy['blog'].text"
          :link-text="copy['blog'].linkText"
          :link-url="copy['blog'].linkUrl" />
        <link-card
          v-if="widgetShouldBeShown('link-studies')"
          :image="copy['studies'].image"
          :image-alt-text="copy['studies'].image_alt_text"
          :header="copy['studies'].header"
          :text="copy['studies'].text"
          :link-text="copy['studies'].linkText"
          :link-url="copy['studies'].linkUrl" />
        <link-card
          v-if="widgetShouldBeShown('intro-component')"
          :video-url="copy['instructional-videos'].video"
          :header="copy['instructional-videos'].header"
          :text="copy['instructional-videos'].text"
          :link-text="copy['instructional-videos'].linkText"
          :link-url="copy['instructional-videos'].linkUrl" />
        <link-card
          v-if="widgetShouldBeShown('metadatabyran')"
          :header="copy['metadatabyran'].header"
          :text="copy['metadatabyran'].text"
          :link-text="copy['metadatabyran'].linkText"
          :link-url="copy['metadatabyran'].linkUrl" />
      </div>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.LandingPage {
  padding-bottom: 2rem;
  &-linkCards {
    padding-top: 2rem;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }
}
</style>
