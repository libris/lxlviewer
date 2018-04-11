import View from './views/view';
import Editor from './views/editor';
import Vocab from './views/vocab';
import PagedCollection from './views/pagedcollection';
import UserSettings from './views/usersettings';
import CreateNew from './views/createnew';
import Import from './views/import';
import About from './views/about';
import Help from './views/help';
import Base from './views/base';

function initPage(id) {
  let view = {};
  if (id === 'pagedcollection') {
    view = new PagedCollection('PagedCollection');
  } else if (id === 'editor') {
    view = new Editor('Editor');
  } else if (id === 'vocab') {
    view = new Vocab('Vocab');
  } else if (id === 'usersettings') {
    view = new UserSettings('UserSettings');
  } else if (id === 'createnew') {
    view = new CreateNew('CreateNew');
  } else if (id === 'import') {
    view = new Import('Import');
  } else if (id === 'about') {
    view = new About('About');
  } else if (id === 'help') {
    view = new Help('Help');
  } else {
    view = new Base('Base');
    console.warn('No corresponding view script. Loading base.');
  }
  view.initialize();
}

initPage(document.body.id);
