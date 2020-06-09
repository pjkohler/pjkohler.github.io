---
layout: default
title: Kohler Visual Neuroscience Lab
permalink: /
---
Our lab focuses on the domain of mid-level visual processing, which begins in primary visual cortex ~100 ms after stimulus onset, and then unfolds over the next several hundred milliseconds, in several, mostly topographically organized visual brain areas. In this deceptively short time-span, the visual system infers information about the shape, location and movement of the elements in the visual world, but also resolves the perceptual organization of the scene: figure-ground relationships, perceptual grouping, constancy operations and much more. These distinct classes of information are encoded by separate neural populations, but are also deeply interdependent, and in many cases represented at multiple stages of visual processing. We probe this dynamic and complex network of brain areas in humans using functional MRI, EEG and visual psychophysics, to better understand how the brain builds the visual scene representation that is the foundation for our vivid visual experience of the world. Our research is undertaken thanks in part to funding from the [Canada First Research Excellence Fund](https://www.cfref-apogee.gc.ca/home-accueil-eng.aspx) and the [Natural Sciences and Engineering Research Council of Canada](https://www.nserc-crsng.gc.ca/index_eng.asp).
### Lab News
<ul id="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> <a href="{{ post.url }}" title="{{ post.title }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>