<script>
import * as _ from 'lodash';
import * as httpUtil from '@/utils/http';

export default {
  name: 'dataset-observations',
  props: {
    statistics: {},
    siteTitle: '',
    statsIndex: {},
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
        observations: {},
    };
  },
  methods: {
      getObservationLabel(observation) {
        if (typeof observation.object.titleByLang !== 'undefined') {
            return observation.object.titleByLang[this.settings.language];
        } else if (typeof observation.object.notation !== 'undefined') {
            return observation.object.notation.join(', ');
        } else if (typeof observation.object.label !== 'undefined') {
            return observation.object.label;
        } else if (typeof observation.object.labelByLang !== 'undefined') {
            return observation.object.labelByLang[this.settings.language];
        } else {
            const idArray = observation.object['@id'].split('/');
            return `${idArray[idArray.length - 1]} (has no label)`;
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
      getObservations() {
          new Promise((resolve, reject) => {
            const url = `/find.json?q=*&_statsrepr=${JSON.stringify(this.statsIndex)}`;
            httpUtil.get({ url: url, accept: 'application/ld+json' }).then((response) => {
            const observations = [];
            _.each(response.stats.sliceByDimension, dimension => {
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
            this.observations = observations;
            resolve(observations);
            }, (error) => {
            reject('Error searching...', error);
            });
          });
      }
  },
  computed: {
  },
  components: {
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      this.getObservations();
    });
  },
};
</script>

<template>
    <div class="observations">
        <div v-for="observation in observations" :key="observation.label" class="observation-container">
            <a :href="observation.view">
                <div class="observation-button">
                    <i :class="`fa fa-fw fa-${observation.icon}`"></i>
                </div>
            </a>
            <a :href="observation.descriptionLink">
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
.observations {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    .observation-container {
        flex-basis: 8em;
        text-align: center;
        margin: 0 1% 2em 1%;
        position: relative;
        .observation-button {
            i {
                position:  absolute;
                top: 0;
                left: 0;
                font-size: 3.5em;
                padding: 0.7em;
            }
            background-color: fadeout(@brand-primary, 85%);
            border-radius: 50%;
            &:before{
                content: "";
                display: block;
                padding-top: 100%; 	/* initial ratio of 1:1*/
            }
            &:hover {
                background-color: fadeout(@brand-primary, 70%);
                > i {
                color: darken(@brand-primary, 15%);
                }
            }
        }

        > a > i {
            position: absolute;
            font-size: 2em;
            top: 100px;
            right: 0;
            color: @brand-primary;
            &:hover {
                color: darken(@brand-primary, 15%);
            }
        }
        .observation-label {
            word-break: break-all;
        }
        .observation-quantity {
            font-size: 0.8em;
            line-height: 0.8em;
        }
    }
}

</style>
