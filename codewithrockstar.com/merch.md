---
title: Home
layout: main
nav_exclude: true
data:
  images:
  - img: teemill/red-logo.webp
    url: https://shop.codewithrockstar.com/
  - img: teemill/blue-logo.webp
    url: https://shop.codewithrockstar.com/
  - img: teemill/red-on-press.webp
    url: https://shop.codewithrockstar.com/
  - img: teemill/blue-tailored.webp
    url: https://shop.codewithrockstar.com/
  - img: teemill/red-basic-fit.webp
    url: https://shop.codewithrockstar.com/
  - img: teemill/blue-kids-fit.webp
    url: https://shop.codewithrockstar.com/
---

# The Rockstar Merch Stand

Want to wear your Rockstar credentials right next to your heart? Head over to <a href="https://shop.codewithrockstar.com/">shop.codewithrockstar.com</a> where we've partnered with those excellent folks at Teemill to create a range of unique, 100% cotton T-shirts, lovingly printed with water-based inks in factories powered by renewable energy. Honestly, the only way you could make these shirts any more awesome would be to stick at Rockstar logo on them... so that's exactly what we did.

Shirts are available in basic, tailored, or kids fit, for all the junior Rockstar developers out there.

<article id="teemill-gallery">
{% for image in page.data.images %}
	<section>
	<a href="{{ image.url }}">
	<img src="/assets/img/{{ image.img }}" />
	</a>
	</section>
{% endfor %}
