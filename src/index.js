import * as VocabUtil from './vocab';
import * as StringUtil from './string';
import * as DisplayUtil from './display';
import * as DataUtil from './data';

export class LxlTools {
  constructor() {
    this._data = {};
    this._data.vocabJson = null;
    this._data.vocab = null;
    this._data.context = null;
    this._data.display = null;
    this._data.settings = null;
    this.installed = false;
  }

  install(vocab, context, display, settings) {
    const vocabMap = new Map(vocab.map((entry) => [entry['@id'], entry]));
    this._data.vocabJson = vocab;
    this._data.vocab = vocabMap;
    this._data.context = context;
    this._data.display = display;
    this._data.settings = settings;
    this.attachMethods();
    this._data.vocabClasses = this.getVocabClasses(vocab);
    this._data.vocabProperties = this.getVocabProperties(vocab);
    this.installed = true;
  }
  logSettings() {
    console.log(this._data.settings);
  }

  getVocabClasses(vocabJson) {
    let classTerms = [].concat(
      VocabUtil.getTermByType('Class', vocabJson, this._data.context),
      VocabUtil.getTermByType('marc:CollectionClass', vocabJson, this._data.context)
    );
    const classes = new Map(classTerms.map(entry => [entry['@id'], entry]));
    classes.forEach(classObj => {
      if (classObj.hasOwnProperty('subClassOf')) {
        _.each(classObj.subClassOf, baseClass => {
          const baseClassObj = classes.get(baseClass['@id']);
          if (typeof baseClassObj !== 'undefined') {
            if (baseClassObj.hasOwnProperty('baseClassOf')) {
              let subId = StringUtil.convertToPrefix(classObj['@id'], this._data.context);
              if (baseClassObj.baseClassOf.indexOf(subId) < 0) {
                baseClassObj.baseClassOf.push(subId);
              }
            } else {
              baseClassObj.baseClassOf = [StringUtil.convertToPrefix(classObj['@id'], this._data.context)];
            }
          }
        });
      }
    });
    return classes;
  }

  getVocabProperties(vocabJson) {
    let props = [];
    props = props.concat(VocabUtil.getTermByType('Property', vocabJson, this._data.context));
    props = props.concat(VocabUtil.getTermByType('DatatypeProperty', vocabJson, this._data.context));
    props = props.concat(VocabUtil.getTermByType('ObjectProperty', vocabJson, this._data.context));
    props = props.concat(VocabUtil.getTermByType('owl:SymmetricProperty', vocabJson, this._data.context));
    const vocabProperties = new Map(props.map((entry) => [entry['@id'], entry]));
    return vocabProperties;
  }

  attachMethods() {
    this.vocab = {}; // Vocabulary methods
    this.vocab.getTermObject              = term                    => VocabUtil.getTermObject(term, this._data.vocab, this._data.context);
    this.vocab.getBaseClasses             = classId                 => VocabUtil.getBaseClasses(classId, this._data.vocab, this._data.context);
    this.vocab.getBaseClassesFromArray    = typeArray               => VocabUtil.getBaseClassesFromArray(typeArray, this._data.vocab, this._data.context);
    this.vocab.isSubClassOf               = (classId, baseClassId)  => VocabUtil.isSubClassOf(classId, baseClassId, this._data.vocab, this._data.context);
    this.vocab.getRecordType              = mainEntityType          => VocabUtil.getRecordType(mainEntityType, this._data.vocab, this._data.context);
    this.vocab.getTermByType              = type                    => VocabUtil.getTermByType(type, this._data.vocabJson, this._data.context);
    this.vocab.getTermFromLabel           = label                   => VocabUtil.getTermFromLabel(label, this._data.settings.language, this._data.vocab);
    this.vocab.getPropertyTypes           = propertyId              => VocabUtil.getPropertyTypes(propertyId, this._data.vocab, this._data.context);
    this.vocab.getAllEnumerationTypesFor  = onProp                  => VocabUtil.getAllEnumerationTypesFor(onProp, this._data.vocab);
    this.vocab.getValuesFrom              = (restrictionProperty, entityType, property) => VocabUtil.getValuesFrom(restrictionProperty, entityType, property, this._data.vocab, this._data.context);
    this.vocab.processRestrictions        = (range, entityType, property) => VocabUtil.processRestrictions(range, entityType, property, this._data.vocab, this._data.context);
    this.vocab.getUnrestrictedRange       = propertyId              => VocabUtil.getUnrestrictedRange(propertyId, this._data.vocab, this._data.context);
    this.vocab.getRange                   = (entityType, propertyId)  => VocabUtil.getRange(entityType, propertyId, this._data.vocab, this._data.context);
    this.vocab.getFullRange               = (entityType, key)       => VocabUtil.getFullRange(entityType, key, this._data.vocab, this._data.context, this._data.vocabClasses);
    this.vocab.getSubClasses              = className               => VocabUtil.getSubClasses(className, this._data.vocabClasses, this._data.context);
    this.vocab.getSubClassChain           = className               => VocabUtil.getSubClassChain(className, this._data.vocabClasses, this._data.context);
    this.vocab.getAllSubClasses           = classArray              => VocabUtil.getAllSubClasses(classArray, this._data.vocabClasses, this._data.context);
    this.vocab.getDomainList              = property                => VocabUtil.getDomainList(property, this._data.vocab, this._data.context);
    this.vocab.getProperties              = classId                 => VocabUtil.getProperties(classId, this._data.vocabClasses, this._data.vocabProperties, this._data.context);
    this.vocab.getContextValue            = (propertyId, key)       => VocabUtil.getContextValue(propertyId, key, this._data.context);
    this.vocab.propIsRepeatable           = propertyId              => VocabUtil.propIsRepeatable(propertyId, this._data.context);
    this.vocab.getPropertiesFromArray     = typeArray               => VocabUtil.getPropertiesFromArray(typeArray, this._data.vocabClasses, this._data.vocabProperties, this._data.context);
    this.vocab.isEmbedded                 = classId                 => VocabUtil.isEmbedded(classId, this._data.vocab, this._data.settings, this._data.context);
    this.vocab.isExtractable              = classId                 => VocabUtil.isExtractable(classId, this._data.vocab, this._data.settings, this._data.context);
    this.vocab.getContextProperty         = propertyId              => VocabUtil.getContextProperty(propertyId, this._data.context);
    this.vocab.getContextWithContainer    = (propertyId, container) => VocabUtil.getContextWithContainer(propertyId, container, this._data.context);
    this.vocab.getBaseUriFromPrefix       = prefix                  => VocabUtil.getBaseUriFromPrefix(prefix, this._data.context);
    this.vocab.getPrefixFromBaseUri       = baseUri                 => VocabUtil.getPrefixFromBaseUri(baseUri, this._data.context);
    this.vocab.isAbstract                 = itemId                  => VocabUtil.isAbstract(itemId, this._data.vocab, this._data.context);
    this.vocab.getTree                    = term                    => VocabUtil.getTree(term, this._data.vocab, this._data.context);
    this.vocab.flattenTree                = termArray               => VocabUtil.flattenTree(termArray, this._data.vocab, this._data.context, this._data.settings.language);
    this.vocab.printTree                  = term                    => VocabUtil.printTree(term, this._data.vocab, this._data.context);

    this.string = {}; // String methods
    this.string.removeDomain              = string                  => StringUtil.removeDomain(string, this._data.settings.removableBaseUris);
    this.string.getCompactUri             = uri                     => StringUtil.getCompactUri(uri, this._data.context);
    this.string.convertToBaseUri          = string                  => StringUtil.convertToBaseUri(string, this._data.context);
    this.string.convertToPrefix           = uri                     => StringUtil.convertToPrefix(uri, this._data.context);
    this.string.convertToVocabKey         = string                  => StringUtil.convertToVocabKey(string, this._data.context);
    this.string.getParamValueFromUrl      = (url, param)            => StringUtil.getParamValueFromUrl(url, param);
    this.string.getHash                   = string                  => StringUtil.getHash(string);
    this.string.isNumeric                 = num                     => StringUtil.isNumeric(num);
    this.string.getNumberOfVowels         = string                  => StringUtil.getNumberOfVowels(string);
    this.string.isLibrisResourceUri       = uri                     => StringUtil.isLibrisResourceUri(uri, this._data.settings.apiPath);
    this.string.getLabelFromObject        = object                  => StringUtil.getLabelFromObject(object, this._data.settings.language);
    this.string.getLabelByLang            = string                  => StringUtil.getLabelByLang(string, this._data.settings.language, this._data.vocab, this._data.context);
    this.string.extractStrings            = obj                     => StringUtil.extractStrings(obj);
    this.string.getFormattedEntries       = list                    => StringUtil.getFormattedEntries(list, this._data.vocab, this._data.settings, this._data.context);

    this.display = {}; // Display methods
    this.display.getValueByLang           = (item, propertyId)      => DisplayUtil.getValueByLang(item, propertyId, this._data.display, this._data.settings.language, this._data.context);
    this.display.getLensById              = id                      => DisplayUtil.getLensById(id, this._data.display);
    this.display.getProperties            = (typeInput, level)      => DisplayUtil.getProperties(typeInput, level, this._data.display);
    this.display.getDisplayObject         = (item, level, quoted)   => DisplayUtil.getDisplayObject(item, level, this._data.display, quoted, this._data.vocab, this._data.settings, this._data.context);
    this.display.getItemSummary           = (item, quoted)          => DisplayUtil.getItemSummary(item, this._data.display, quoted, this._data.vocab, this._data.settings, this._data.context, this._data.settings.displayGroups);
    this.display.getItemLabel             = (item, quoted)          => DisplayUtil.getItemLabel(item, this._data.display, quoted, this._data.vocab, this._data.settings, this._data.context);
    this.display.getChip                  = (item, quoted)          => DisplayUtil.getChip(item, this._data.display, quoted, this._data.vocab, this._data.settings, this._data.context);
    this.display.getCard                  = (item, quoted)          => DisplayUtil.getCard(item, this._data.display, quoted, this._data.vocab, this._data.settings, this._data.context);
    this.display.getFormattedSelectOption = term                    => DisplayUtil.getFormattedSelectOption(term, this._data.settings, this._data.vocab, this._data.context);

    this.data = {} // Data methods
    this.data.getEmbellished              = (id, quotedIndex)       => DataUtil.getEmbellished(id, quotedIndex);
    this.data.getMergedItems              = (record, mainEntity, work, quoted) => DataUtil.getMergedItems(record, mainEntity, work, quoted);
    this.data.removeNullValues            = inputObj                => DataUtil.removeNullValues(inputObj);
    this.data.xmlToJson                   = xml                     => DataUtil.xmlToJson(xml);

  }
}

export const lxl = new LxlTools();

setTimeout(() => {
  if (!lxl.installed) {
    console.warn('%c LXL ', 'background: #009788; color: #fff;', '🛠️ Looks like you didn\'t call the install method of lxltools package!');
  }
}, 5000);
