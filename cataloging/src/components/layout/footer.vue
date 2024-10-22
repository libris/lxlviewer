<script>
import { mapGetters } from 'vuex';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'footer-component',
  setup() {
    return {
      kbLogoBlack: new URL('~kungbib-styles/dist/assets/kb_logo_black.svg', import.meta.url).href,
    };
  },
  data() {
    return {
      keyword: '',
    };
  },
  methods: {
    translatePhrase,
  },
  computed: {
    ...mapGetters([
      'settings',
    ]),
  },
  components: {
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <footer class="Footer">
    <div class="Footer-content">
      <div class="Footer-serviceName">
        <img :src="kbLogoBlack" class="Footer-serviceLogo" alt="Kungliga bibliotekets logotyp" />
        <a class="Footer-link" href="http://www.kb.se" alt="Länk till Kungliga bibliotekets webbplats">
          {{ translatePhrase("National Library of Sweden") }}
        </a>
      </div>

      <div class="Footer-navGroup">
        <nav class="Footer-nav" aria-labelledby="footer-xl-nav">
          <h4 id="footer-xl-nav" class="Footer-listTitle">{{ translatePhrase("Information") }}</h4>
          <div class="Footer-navGroup">
            <ul class="Footer-navList">
              <li>
                <router-link class="Footer-link" to="/about">{{ translatePhrase("About XL") }}</router-link>
              </li>
              <li>
                <a href="https://www.kb.se/libris-versionsinformation" class="Footer-link">{{ translatePhrase("Release notes") }}</a>
              </li>
              <li>
                <a
                  href="https://www.kb.se/om-oss/hantering-av-personuppgifter.html#XLkat"
                  class="Footer-link">{{ translatePhrase("GDPR compliance") }}</a>
              </li>
              <li>
                <a href="https://www.kb.se/digital-tillganglighet" class="Footer-link">{{ translatePhrase("Accessibility statement") }}</a>
              </li>
            </ul>
            <ul class="Footer-navList">
              <li>
                <a href="https://kbplay.mediaflowportal.com/folder/91512/" class="Footer-link">{{ translatePhrase("Instruction videos") }}</a>
              </li>
              <li>
                <a
                  href="https://www.kb.se/libris/Om-LIBRIS/Introduktion-till-nya-Libris-och-XL/"
                  class="Footer-link">{{ translatePhrase("Introduction material") }}</a>
              </li>
              <li>
                <a href="http://www.kb.se/libris/" class="Footer-link">{{ translatePhrase("About Libris") }}</a>
              </li>
              <li>
                <a href="https://libris.kb.se/" class="Footer-link">{{ translatePhrase("Libris web search") }}</a>
              </li>
            </ul>
          </div>
        </nav>

        <nav class="Footer-nav" aria-labelledby="footer-support-nav">
          <h4 id="footer-support-nav" class="Footer-listTitle">{{ translatePhrase("Contact") }}</h4>
          <ul class="Footer-navList">
            <li>
              <a
                class="Footer-link"
                href="https://www.kb.se/om-oss/kontakta-oss/#item-47bef1f3916eca87a61b1eed">{{ translatePhrase("Libris customer service") }}</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </footer>
</template>

<style lang="less">

.Footer {
  padding: 2em 10px;
  background-color: @bg-footer;
  color: @text-footer;

  &-content {
    display: flex;
    justify-content: center;
  }

  &-serviceName {
    padding: 0 1em;
    flex: 20% 1 1;
    font-size: 14px;
    font-size: 1.4rem;
    line-height: 1.2;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    justify-content: flex-start;
    display: block;

   @media (min-width: 768px) {
      display: flex;
      text-align: center;
      font-size: 16px;
      font-size: 1.6rem;
    }
  }

  &-serviceLogo {
    height: 75px;
    margin: 0 30px 10px 0;
    width: auto;

    @media (min-width: 768px) {
      display: inline-block;
      margin: 0 0 10px;
    }

    @media (min-width: 998px) {
      margin: 0 0 10px;
    }
  }

  &-navGroup {
    display: block;
    list-style-type: none;
    flex: 80% 2 2;

    @media (min-width: @screen-sm) {
      display: flex;
    }
  }

  &-nav {
    flex: 25% 2 2;
    flex-direction: column;
    margin: 0 20px 20px 0;
  }

  &-navList {
    font-size: 14px;
    font-size: 1.4rem;
    list-style-type: none;
    margin: 0;
    padding: 0;

    @media (min-width: @screen-md) {
      font-size: 16px;
      font-size: 1.6rem;
    }
  }

  &-navList:not(:last-child) {
    margin-right: 20px;
  }

  &-listTitle {
    font-size: 14px;
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0 0 0.8rem 0;

    @media (min-width: @screen-md) {
      font-size: 16px;
      font-size: 1.6rem;
    }
  }

  @media print {
    display: none;
  }
}

</style>
