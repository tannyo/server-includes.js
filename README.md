# server-includes.js

Emulate apache server side file includes in javascript.

## Usage

    <script src="path/to/server-includes.js"></script>

## Notes

Put the script element for server-includes before all your other javascript is loaded. This allows server-includes to run and process includes that may contain script elements. If you put your other javascript in an include at the bottom of your code, you can make sure that all the DOM is loaded before running javascript that may rely on DOM elements.

I needed to test a website that used apache server side virtual file includes. Unfortunately I did not have an apache server available (don't ask) so I wrote a javascript module to do the includes for me. Since the website only used virtual includes, the code treats virtual and normal includes the same. Since the module uses AJAX calls to get the include fragments, it must be run from a server. This means that you can call any server side program to return the data you need. The website I was called in to work on used the following format for their web pages.

    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Page Title</title>
      <meta name="description" content="">
      <!--#include virtual="hreflang-page.html" -->
      <!--#include virtual="head.html" -->
    </head>
    <body>
      <!--#include virtual="nav.html" -->
      <!-- content -->
      <div class="view">
        ...
      </div>
      <!-- content end -->

      <!--#include virtual="footer.html" -->
      <script src="js/startup.js"></script>
    </body>
    </html>

There were nested virtual includes in nav.html and footer.html. I put code in to check to see if I was running local and if so, ran the server-includes code. This made sure that the code was only run in a local development environment.

    if (!/local/.test(location.hostname.toLowerCase())) {
      // Not running local, do not run server-includes.
      return;
    }

    // Server Side Include code follows.

This code **does not** support varibles, conditionals, exec, or any other SSI directive. it only supports file includes through

    <!--#include virtual="file-name" -->

or

    <!--#include file="file-name" -->

Would I use server-includes.js in a production environment? No. Search engines would not be able to search my site, just as search engines have trouble with Angularjs and other single page web application frameworks.

Thinking about it since this uses a traditional page load methodology, if you had a prebuilt sitemap.xml file that included every page, you could use server-includes.js for your site since the content resides in the page. However, if you don't have an apache server and pretty much just have a static site, just use a tool like Dreamweaver or one of any available tools to generate your website for you with the included files.

## Browser Support

Tested in the latest versions of Chrome, Firefox, Safari, IE 9 - 11, iOS, and Android.

## Issues

Have a bug? Please create an [issue](https://github.com/tannyo/server-includes.js/issues) here on GitHub!

## Contributing

Want to contribute? Great! Just fork the project, make your changes and open a [pull request](https://github.com/tannyo/server-includes.js/pulls).

## Changelog
* v0.10 2014-05-02 TKO Created by Tanny O'Haley
* v0.11 2014-09-04 TKO Added ability to process nested includes.

## License

The MIT License (MIT)

Copyright (c) 2014 [Tanny O'Haley](http://tanny.ica.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
