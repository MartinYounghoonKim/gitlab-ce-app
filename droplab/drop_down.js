import utils from './utils';
import { SELECTED_CLASS, IGNORE_CLASS, IGNORE_HIDING_CLASS } from './constants';

class DropDown {
  constructor(list, config = {}) {
    this.currentIndex = 0;
    this.hidden = true;
    this.list = typeof list === 'string' ? document.querySelector(list) : list;
    this.items = [];
    this.eventWrapper = {};

    if (config.addActiveClassToDropdownButton) {
      this.dropdownToggle = this.list.parentNode.querySelector('.js-dropdown-toggle');
    }

    this.getItems();
    this.initTemplateString();
    this.addEvents();

    this.initialState = list.innerHTML;
  }

  getItems() {
    this.items = [].slice.call(this.list.querySelectorAll('li'));
    return this.items;
  }

  initTemplateString() {
    const items = this.items || this.getItems();

    let templateString = '';
    if (items.length > 0) templateString = items[items.length - 1].outerHTML;
    this.templateString = templateString;

    return this.templateString;
  }

  clickEvent(e) {
    if (e.target.tagName === 'UL') return;
    if (e.target.classList.contains(IGNORE_CLASS)) return;

    const selected = utils.closest(e.target, 'LI');
    if (!selected) return;

    this.addSelectedClass(selected);

    e.preventDefault();
    if (!e.target.classList.contains(IGNORE_HIDING_CLASS)) this.hide();

    const listEvent = new CustomEvent('click.dl', {
      detail: {
        list: this,
        selected,
        data: e.target.dataset,
      },
    });
    this.list.dispatchEvent(listEvent);
  }

  addSelectedClass(selected) {
    this.removeSelectedClasses();
    selected.classList.add(SELECTED_CLASS);
  }

  removeSelectedClasses() {
    const items = this.items || this.getItems();

    items.forEach(item => item.classList.remove(SELECTED_CLASS));
  }

  addEvents() {
    this.eventWrapper.clickEvent = this.clickEvent.bind(this);
    this.eventWrapper.closeDropdown = this.closeDropdown.bind(this);

    this.list.addEventListener('click', this.eventWrapper.clickEvent);
    this.list.addEventListener('keyup', this.eventWrapper.closeDropdown);
  }

  closeDropdown(event) {
    // `ESC` key closes the dropdown.
    if (event.keyCode === 27) {
      event.preventDefault();
      return this.toggle();
    }

    return true;
  }

  setData(data) {
    this.data = data;
    this.render(data);
  }

  addData(data) {
    this.data = (this.data || []).concat(data);
    this.render(this.data);
  }

  render(data) {
    const children = data ? data.map(this.renderChildren.bind(this)) : [];
    const renderableList = this.list.querySelector('ul[data-dynamic]') || this.list;

    renderableList.innerHTML = children.join('');

    const listEvent = new CustomEvent('render.dl', {
      detail: {
        list: this,
      },
    });
    this.list.dispatchEvent(listEvent);
  }

  renderChildren(data) {
    const html = utils.template(this.templateString, data);
    const template = document.createElement('div');

    template.innerHTML = html;
    DropDown.setImagesSrc(template);
    template.firstChild.style.display = data.droplab_hidden ? 'none' : 'block';

    return template.firstChild.outerHTML;
  }

  show() {
    if (!this.hidden) return;
    this.list.style.display = 'block';
    this.currentIndex = 0;
    this.hidden = false;

    if (this.dropdownToggle) this.dropdownToggle.classList.add('active');
  }

  hide() {
    if (this.hidden) return;
    this.list.style.display = 'none';
    this.currentIndex = 0;
    this.hidden = true;

    if (this.dropdownToggle) this.dropdownToggle.classList.remove('active');
  }

  toggle() {
    if (this.hidden) return this.show();

    return this.hide();
  }

  destroy() {
    this.hide();
    this.list.removeEventListener('click', this.eventWrapper.clickEvent);
    this.list.removeEventListener('keyup', this.eventWrapper.closeDropdown);
  }

  static setImagesSrc(template) {
    const images = [...template.querySelectorAll('img[data-src]')];

    images.forEach((image) => {
      const img = image;

      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
  }
}

export default DropDown;