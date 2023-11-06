<script>
import copy from '@/resources/json/copy.json';

export default {
  name: 'about-component',
  setup() {
    const { 'about-xl-full': helpCopy } = copy;
    return {
      header: helpCopy.header,
      image: new URL(`/src/assets/img/${helpCopy.image}`, import.meta.url).href,
      imageAltText: helpCopy.image_alt_text,
      text: helpCopy.text,
    };
  },
};
</script>

<template>
  <article class="panel panel-default Article">
    <img :src="image" class="Article-featuredImg" :alt="imageAltText" title="Abstract XL Graphics" />
    <div class="Article-content">
      <header class="Article-header">
        <h1 class="Article-title">{{ header }}</h1>
        <div class="abstract Article-abstract">{{ text.abstract }}</div>
      </header>

      <section class="Article-section" v-for="section in text.sections" :key="section.title">
        <h2 class="Article-sectionTitle">{{ section.header }}</h2>
        <div v-html="section.text" class="section-text Article-sectionText" />
      </section>
    </div>
  </article>
</template>

<style lang="less">

.Article {

  &-featuredImg {
    width: 100%;
  }

  &-title {
    font-size: 48px;
    font-size: 4.8rem;
    font-weight: 500;
  }

  &-abstract {
    font-size: 2px;
    font-size: 2rem;
    font-weight: 700;
  }

  &-content {
    padding: 2em 5em 4em;
  }

  &-section {
    margin: 0 0 2em;
  }
}
</style>
