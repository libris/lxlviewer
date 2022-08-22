<script>
import { mapGetters } from 'vuex';

export default {
  name: 'footer-component',
  props: {
  },
  data() {
    return {
      keyword: '',
    };
  },
  methods: {
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
          <img src="~kungbib-styles/dist/assets/kb_logo_black.svg" class="Footer-serviceLogo" alt="Kungliga bibliotekets logotyp" />
          <a class="Footer-link" href="http://www.kb.se" alt="Länk till Kungliga bibliotekets webbplats">
            {{ "National Library of Sweden" | translatePhrase }}
          </a>
        </div>

        <div class="Footer-navGroup">
          <nav class="Footer-nav" aria-labelledby="footer-xl-nav">
            <h4 id="footer-xl-nav" class="Footer-listTitle">{{ "Information" | translatePhrase }}</h4>
            <div class="Footer-navGroup">
              <ul class="Footer-navList">
                <li>
                  <router-link class="Footer-link" to="/about" >{{ "About XL" | translatePhrase }}</router-link>
                </li>
                <li>
                  <a href="https://www.kb.se/libris-versionsinformation" class="Footer-link">{{ "Release notes" | translatePhrase }}</a>
                </li>
                <li>
                  <a href="https://www.kb.se/om-oss/hantering-av-personuppgifter.html#XLkat" class="Footer-link">{{ "GDPR compliance" | translatePhrase }}</a>
                </li>
                <li>
                  <a href="https://www.kb.se/digital-tillganglighet" class="Footer-link">{{ "Accessibility statement" | translatePhrase }}</a>
                </li>
              </ul>
              <ul class="Footer-navList">
                <li>
                  <a href="https://www.youtube.com/playlist?list=PLZVkEICvA5-GRT2oJQmLgq_2Pksx6zYPy" class="Footer-link">{{ "Instruction videos" | translatePhrase }}</a>
                </li>
                <li>
                  <a href="https://www.kb.se/samverkan-och-utveckling/libris.html" class="Footer-link">{{ "Libris news" | translatePhrase }}</a>
                </li>
                <li>
                  <a href="https://www.kb.se/libris/Om-LIBRIS/Introduktion-till-nya-Libris-och-XL/" class="Footer-link">{{ "Introduction material" | translatePhrase }}</a>
                </li>
                <li>
                  <a href="http://www.kb.se/libris/" class="Footer-link">{{ "kb.se/libris" | translatePhrase }}</a>
                </li>
                <li>
                  <a href="https://libris.kb.se/" class="Footer-link">{{ "libris.kb.se" | translatePhrase }}</a>
                </li>
              </ul>
            </div>
          </nav>

          <nav class="Footer-nav" aria-labelledby="footer-support-nav">
            <h4 id="footer-support-nav" class="Footer-listTitle">{{ "Contact" | translatePhrase }}</h4>
            <ul class="Footer-navList">
              <li>
                <a class="Footer-link" href="https://www.kb.se/om-oss/kontakta-oss/#item-47bef1f3916eca87a61b1eed">{{ "Libris customer service" | translatePhrase }}</a>
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
