# Soundcloud2image

## Usage

```markdown
![<soundcloud-url>](https://soundcloud2image.vercel.app/api/image?url=<soundcloud-url>)
```

### Example

![https://soundcloud.com/lolipo/lucky-lotus-8-vip](https://soundcloud2image.vercel.app/api/image?url=https://soundcloud.com/lolipo/lucky-lotus-8-vip)

```markdown
![https://soundcloud.com/lolipo/lucky-lotus-8-vip](https://soundcloud2image.vercel.app/api/image?url=https://soundcloud.com/lolipo/lucky-lotus-8-vip)
```

### For Scrapbox

https://scrapbox.io/sno2wman/soundcloud2image#6251381513a15800008fc519

```javascript
// https://scrapbox.io/api/code/sno2wman/soundcloud2image/userscript.js

const soundcloudRegex = /https:\/\/soundcloud.com\/.+\/.+/;
scrapbox.PopupMenu.addButton({
  title: text => soundcloudRegex.test(text) ? "Soundcloud" : null,
  onClick: (text) => {
    const url = text.match(soundcloudRegex);
    return `[https://soundcloud2image.vercel.app/image?url=${url}#.png ${url}]`;
  },
});
```

## Bonus Stage

References: https://scrapbox.io/sno2wman/2img

- https://github.com/ci7lus/tweet2image
- https://github.com/nwtgck/gh-card
- https://github.com/rinsuki/nicothumb2img
- https://github.com/SnO2WMaN/spotify2image

## License

[MIT License](https://github.com/SnO2WMaN/soundcloud2image/blob/main/LICENSE)
