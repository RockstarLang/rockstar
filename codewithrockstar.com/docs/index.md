---
title: Docs Home
layout: home
examples: /examples/01-getting-started/
nav_exclude: false
nav_order: "0000"

---

<h1>Rockstar Docs</h1>

<p>This is the official documentation for Rockstar v2.</p>
<p>Yes, the joke has documentation. If we didn't have docs, we wouldn't be able to make 
a joke about how Tommy used to work on the docs.</p> 
<ul id="index-nav">
{% assign contents = site.pages | where_exp:"item", "item.summary != nil" %}
{% for page in contents %}
    <li>
        <a href="{{ page.url | relative_url }}">{{ page.title }}</a>
        <p>{{ page.summary }}</p>
</li>
{% endfor %}
</ul>
