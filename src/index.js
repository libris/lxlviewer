import * as VocabUtil from './vocab';
import * as StringUtil from './string';
import * as DisplayUtil from './display';
import * as DataUtil from './data';

export class LxlTools {
  constructor() {
    this.data = {};
    this.data.vocab = null;
    this.data.context = null;
    this.data.display = null;
    this.data.settings = null;
    this.installed = false;
  }

  install(vocab, context, display, settings) {
    this.data.vocab = vocab;
    this.data.context = context;
    this.data.display = display;
    this.data.settings = settings;
    this.attachMethods();
    this.installed = true;
  }
  logSettings() {
    console.log(this.data.settings);
  }

  attachMethods() {
    this.vocab = {}; // Vocabulary methods
    this.vocab.getTermObject              = term                    => VocabUtil.getTermObject(term, this.data.vocab, this.data.context);
    this.vocab.getBaseClasses             = classId                 => VocabUtil.getBaseClasses(classId, this.data.vocab, this.data.context);
    this.vocab.getBaseClassesFromArray    = typeArray               => VocabUtil.getBaseClassesFromArray(typeArray, this.data.vocab, this.data.context);
    this.vocab.isSubClassOf               = (classId, baseClassId)  => VocabUtil.isSubClassOf(classId, baseClassId, this.data.vocab, this.data.context);
    this.vocab.getRecordType              = mainEntityType          => VocabUtil.getRecordType(mainEntityType, this.data.vocab, this.data.context);
    this.vocab.getTermByType              = (type, list)            => VocabUtil.getTermByType(type, list, this.data.context);
    this.vocab.getTermFromLabel           = label                   => VocabUtil.getTermFromLabel(label, this.data.settings.language, this.data.vocab);
    this.vocab.getPropertyTypes           = propertyId              => VocabUtil.getPropertyTypes(propertyId, this.data.vocab, this.data.context);
    this.vocab.getAllEnumerationTypesFor  = onProp                  => VocabUtil.getAllEnumerationTypesFor(onProp, this.data.vocab);
    this.vocab.getValuesFrom              = (restrictionProperty, entityType, property) => VocabUtil.getValuesFrom(restrictionProperty, entityType, property, this.data.vocab, this.data.context);
    this.vocab.processRestrictions        = (range, entityType, property) => VocabUtil.processRestrictions(range, entityType, property, this.data.vocab, this.data.context);
    this.vocab.getUnrestrictedRange       = propertyId              => VocabUtil.getUnrestrictedRange(propertyId, this.data.vocab, this.data.context);
    this.vocab.getRange                   = (entityType, propertyId)  => VocabUtil.getRange(entityType, propertyId, this.data.vocab, this.data.context);
    this.vocab.getFullRange               = (entityType, key)       => VocabUtil.getFullRange(entityType, key, this.data.vocab, this.data.context, this.data.vocabClasses);
    this.vocab.getSubClasses              = className               => VocabUtil.getSubClasses(className, this.data.vocabClasses, this.data.context);
    this.vocab.getSubClassChain           = className               => VocabUtil.getSubClassChain(className, this.data.vocabClasses, this.data.context);
    this.vocab.getAllSubClasses           = classArray              => VocabUtil.getAllSubClasses(classArray, this.data.vocabClasses, this.data.context);
    this.vocab.getDomainList              = property                => VocabUtil.getDomainList(property, this.data.vocab, this.data.context);
    this.vocab.getProperties              = classId                 => VocabUtil.getProperties(classId, this.data.vocabClasses, this.data.vocabProperties, this.data.context);
    this.vocab.getContextValue            = (propertyId, key)       => VocabUtil.getContextValue(propertyId, key, this.data.context);
    this.vocab.propIsRepeatable           = propertyId              => VocabUtil.propIsRepeatable(propertyId, this.data.context);
    this.vocab.getPropertiesFromArray     = typeArray               => VocabUtil.getPropertiesFromArray(typeArray, this.data.vocabClasses, this.data.vocabProperties, this.data.context);
    this.vocab.isEmbedded                 = classId                 => VocabUtil.isEmbedded(classId, this.data.vocab, this.data.settings, this.data.context);
    this.vocab.isExtractable              = classId                 => VocabUtil.isExtractable(classId, this.data.vocab, this.data.settings, this.data.context);
    this.vocab.getContextProperty         = propertyId              => VocabUtil.getContextProperty(propertyId, this.data.context);
    this.vocab.getContextWithContainer    = (propertyId, container) => VocabUtil.getContextWithContainer(propertyId, container, this.data.context);
    this.vocab.getBaseUriFromPrefix       = prefix                  => VocabUtil.getBaseUriFromPrefix(prefix, this.data.context);
    this.vocab.getPrefixFromBaseUri       = baseUri                 => VocabUtil.getPrefixFromBaseUri(baseUri, this.data.context);
    this.vocab.isAbstract                 = itemId                  => VocabUtil.isAbstract(itemId, this.data.vocab, this.data.context);
    this.vocab.getTree                    = term                    => VocabUtil.getTree(term, this.data.vocab, this.data.context);
    this.vocab.flattenTree                = termArray               => VocabUtil.flattenTree(termArray, this.data.vocab, this.data.context, this.data.settings.language);
    this.vocab.printTree                  = term                    => VocabUtil.printTree(term, this.data.vocab, this.data.context);

    this.string = {}; // String methods
    this.string.removeDomain              = string                  => StringUtil.removeDomain(string, this.data.settings.removableBaseUris);
    this.string.getCompactUri             = uri                     => StringUtil.getCompactUri(uri, this.data.context);
    this.string.convertToBaseUri          = string                  => StringUtil.convertToBaseUri(string, this.data.context);
    this.string.convertToPrefix           = uri                     => StringUtil.convertToPrefix(uri, this.data.context);
    this.string.convertToVocabKey         = string                  => StringUtil.convertToVocabKey(string, this.data.context);
    this.string.getParamValueFromUrl      = (url, param)            => StringUtil.getParamValueFromUrl(url, param);
    this.string.getHash                   = string                  => StringUtil.getHash(string);
    this.string.isNumeric                 = num                     => StringUtil.isNumeric(num);
    this.string.getNumberOfVowels         = string                  => StringUtil.getNumberOfVowels(string);
    this.string.isLibrisResourceURi       = (uri, apiPath)          => StringUtil.isLibrisResourceUri(uri, apiPath);
    this.string.getLabelFromObject        = object                  => StringUtil.getLabelFromObject(object, this.data.settings.language);
    this.string.getLabelByLang            = string                  => StringUtil.getLabelByLang(string, this.data.settings.language, this.data.vocab, this.data.context);
    this.string.extractStrings            = obj                     => StringUtil.extractStrings(obj);
    this.string.getFormattedEntries       = list                    => StringUtil.getFormattedEntries(list, this.data.vocab, this.data.settings, this.data.context);

    this.display = {}; // Display methods
    this.display.getValueByLang           = (item, propertyId)      => DisplayUtil.getValueByLang(item, propertyId, this.data.display, this.data.settings.language, this.data.context);
    this.display.getLensById              = id                      => DisplayUtil.getLensById(id, this.data.display);
    this.display.getProperties            = (typeInput, level)      => DisplayUtil.getProperties(typeInput, level, this.data.display);
    this.display.getDisplayObject         = (item, level, quoted)   => DisplayUtil.getDisplayObject(item, level, this.data.display, quoted, this.data.vocab, this.data.settings, this.data.context);
    this.display.getItemSummary           = (item, quoted)          => DisplayUtil.getItemSummary(item, this.data.display, quoted, this.data.vocab, this.data.settings, this.data.context, this.data.settings.displayGroups);
    this.display.getItemLabel             = (item, quoted)          => DisplayUtil.getItemLabel(item, this.data.display, quoted, this.data.vocab, this.data.settings, this.data.context);
    this.display.getChip                  = (item, quoted)          => DisplayUtil.getChip(item, this.data.display, quoted, this.data.vocab, this.data.settings, this.data.context);
    this.display.getCard                  = (item, quoted)          => DisplayUtil.getCard(item, this.data.display, quoted, this.data.vocab, this.data.settings, this.data.context);
    this.display.getFormattedSelectOption = term                    => DisplayUtil.getFormattedSelectOption(term, this.data.settings, this.data.vocab, this.data.context);

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
}, 1000);
