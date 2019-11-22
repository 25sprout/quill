import Parchment from 'parchment';
import EXIF from 'exif-js';
import { sanitize } from '../formats/link';

const ATTRIBUTES = [
  'alt',
  'height',
  'width'
];

const detectOrientation = (orientation) => {
  let transform = null;
  switch (orientation) {
    case 1: // The 0th row is at the visual top of the image, and the 0th column is the visual left-hand side.
      break;
    case 2: // The 0th row is at the visual top of the image, and the 0th column is the visual right-hand side.
      transform = "rotateY(180deg)";
      break;
    case 3: // The 0th row is at the visual bottom of the image, and the 0th column is the visual right-hand side.
      transform = "rotateY(360deg) rotate(180deg)";
      break;
    case 4: // Toe 0th row is at the visual bottom of the image, and the 0th column is the visual left-hand side.
      transform = "rotateX(180deg)";
      break;
    case 5: // The 0th row is the visual left-hand side of the image, and the 0th column is the visual top.
      transform = "rotateY(180deg) rotate(90deg)";
      break;
    case 6: // The 0th row is the visual right-hand side of the image, and the 0th column is the visual top.
      transform = "rotate(90deg)";
      break;
    case 7: // The 0th row is the visual right-hand side of the image, and the 0th column is the visual bottom.
      transform = "rotateY(180deg) rotate(270deg)";
      break;
    case 8: // The 0th row is the visual left-hand side of the image, and the 0th column is the visual bottom.
      transform = "rotate(270deg)";
      break;
    default:
      break;
  }
  return transform;
}


class Image extends Parchment.Embed {
  static create(value) {
    let node = super.create(value);
    if (typeof value === 'string') {
      node.setAttribute('src', this.sanitize(value));
    }

    node.onload = function () {
      EXIF.getData(node, function () {
        const allMetaData = EXIF.getAllTags(this);
        const transform = detectOrientation(allMetaData.Orientation);
        if (transform) {
          node.style.transform = transform;
        }
      });
    }

    return node;
  }

  static formats(domNode) {
    return ATTRIBUTES.reduce(function(formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  static match(url) {
    return /\.(jpe?g|gif|png)$/.test(url) || /^data:image\/.+;base64/.test(url);
  }

  static sanitize(url) {
    return sanitize(url, ['http', 'https', 'data']) ? url : '//:0';
  }

  static value(domNode) {
    return domNode.getAttribute('src');
  }

  format(name, value) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}
Image.blotName = 'image';
Image.tagName = 'IMG';


export default Image;
