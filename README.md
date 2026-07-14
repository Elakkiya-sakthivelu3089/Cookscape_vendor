# CookScape Official

CookScape Official is a static website for a home interior and furniture brand. It includes marketing pages, service pages, blog pages, contact forms, gallery content, and downloadable brochures.

## Project Overview

This repository is a front-end only site built with:

- HTML pages for each section of the website
- CSS for layout and styling
- JavaScript for UI behavior, sliders, validation, popup handling, and form submissions
- Static assets such as images, fonts, and PDF brochures

The site appears to support multiple lead capture flows, including:

- A main contact form
- A short contact popup
- A multi-step quick estimate form

These forms send data to an external API endpoint rather than directly sending email from the browser.

## Main Pages

Some of the important pages in the repo are:

- `index.html`
- `about.html`
- `services.html`
- `contact.html`
- `gallery.html`
- `blog.html`
- `blog-detail.html`
- `quickestimate.html`
- `privacy.html`
- `privacy-policy.html`
- `terms.html`

## Assets Folder

The `assets` directory contains:

- `assets/css` for styling files
- `assets/js` for all JavaScript behavior
- `assets/images` for site images
- `assets/fonts` for font files
- PDF brochures and project documents

## JavaScript Behavior

The main interactive logic is in `assets/js/script.js`. It handles:

- Contact form submission
- Quick estimate form steps
- Popup display logic
- Basic validation
- Swiper and animation-related UI behavior

## How To Run Locally

Because this is a static site, you can run it with any simple local web server.

### Option 1: Python

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Option 2: Node

```powershell
npx http-server .
```

or

```powershell
npx serve .
```

## Notes

- `index.html` is the home page.
- The site includes `.htaccess` and `Web.config`, so it can also be hosted on Apache or IIS.
- Form submissions depend on the external API at `https://api.juaninfotech.com/api/User/SendCookscapeEmail`.

## Folder Structure

```text
CookScape_official/
- assets/
- about.html
- contact.html
- index.html
- quickestimate.html
- services.html
- Web.config
- .htaccess
```

