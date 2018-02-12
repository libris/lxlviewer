<script>
import Copy from '@/resources/json/copy.json';

export default {
  name: 'about-component',
  computed: {
    copy() {
      return Copy['about-xl-full'];
    },
    header() {
      return this.copy.header;
    },
    image() {
      return require(`@/assets/img/${this.copy.image}`);
    },
    text() {
      return this.copy.text;
    },
  },
};
</script>

<template>
  <div class="panel panel-default about-content">
    <img :src="image" />
    <div class="panel-body container-fluid">
      <div>
        <div class="header">{{ header }}</div>
        <div class="abstract">{{ text.abstract }}</div>
        <div class="section" v-for="section in text.sections">
          <div class="section-header">{{ section.header }}</div>
          <div v-html="section.text"class="section-text"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.about-content {
  margin-top: 15vh;
  > img {
    width: 100%;
  }
  > div > div {
    padding: 0 4em 4em 4em;
    .header {
      font-size: 3em;
    }
    .abstract {
      font-weight: bold;
    }
    .section {
      margin: 2em 0 0 0;
      .section-header {
        font-size: 1.2em;
      }
      .section-text {
        font-size: 1em;
      }
    }
  }
}

</style>
