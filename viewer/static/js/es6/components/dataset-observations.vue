<script>
import * as _ from 'lodash';
export default {
  name: 'dataset-observations',
  props: {
    statistics: {},
    siteTitle: '',
  },
  data() {
    return {
        icons: {
            "Text": "file-text",
            "Textmanuskript": "file-text",
            "Kartmaterial": "globe",
            "Stillbild": "image",
            "Musik": "music",
            "Musiknoter": "music",
            "Ljudmaterial": "file-audio-o",
            "Kit": "cube",
            "Projicerad bild": "film",
            "Multimedia": "play-circle-o"
        },
        vocabUrl: 'https://id.kb.se/vocab/',
    };
  },
  methods: {
      getObservationLabel(observation) {
        if (typeof observation.object.titleByLang !== 'undefined') {
            return observation.object.titleByLang.sv;
        } else if (typeof observation.object.notation !== 'undefined') {
            return observation.object.notation.join(', ');
        } else {
            return observation.object.labelByLang.sv;
        }
      },
      getObservationIcon(label) {
        if (typeof this.icons[label] !== 'undefined') {
            return this.icons[label];
        }
        return 'file';
      },
      getDescriptionLink(id) {
        const vocabLink = id.slice(0, id.lastIndexOf('/') + 1) + '#' + id.slice(id.lastIndexOf('/') + 1);
        return this.siteTitle === 'libris.kb.se' ? vocabLink : id;
      },
  },
  computed: {
      observations() {
          const observations = [];
        _.each(this.statistics.sliceByDimension, dimension => {
            _.each(dimension.observation, observation => {
                const newObservation = {};
                newObservation['@id'] = observation.object['@id'];
                newObservation['@type'] = observation.object['@type'];
                newObservation.label = this.getObservationLabel(observation);
                newObservation.totalItems = observation.totalItems;
                newObservation.view = observation.view['@id'];
                newObservation.icon = this.getObservationIcon(newObservation.label);
                newObservation.descriptionLink = this.getDescriptionLink(observation.object['@id']);
                observations.push(newObservation);
            });
        });
        return observations;
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
    <div class="col-md-8 col-md-offset-2 observations">
        <div v-for="observation in observations" class="observation-container">
            <a href="{{observation.view}}">
                <div class="observation-button">
                    <i class="fa fa-fw fa-{{observation.icon}}"></i>
                </div>
            </a>
            <a href="{{observation.descriptionLink}}">
                <i class="fa fa-info-circle" aria-hidden="true"></i>
            </a>
            <div class="observation-label">
               {{observation.label}}
            </div>
            <div class="observation-quantity">
                {{observation.totalItems}} st.
            </div>
        </div>
    </div> 
</template>

<style lang="less">
@import './_variables.less';

</style>
