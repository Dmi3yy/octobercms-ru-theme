# Markup Guide

- [Default variables](#default-variables)
- [Page links](#page-links)
- [Links to asset files](#theme-filter)
- [Flash messages](#flash-messages)
- [Forms](#forms)
- [Injecting CSS links](#styles-tag)
- [Injecting JavaScript scripts](#scripts-tag)

October extends [Twig](http://twig.sensiolabs.org/documentation) engine with a number of functions, tags, filters and variables. Those extensions allow you to use the CMS features and access the page environment information inside your templates.

Please refer to the [Twig documentation](http://twig.sensiolabs.org/doc/templates.html) for the full information about the native Twig language syntax and elements.

<a name="default-variables" class="anchor" href="#default-variables"></a>
## Default variables

The `this` variable is always presented in October Twig environment. This variable contains an object with three fields: 

- **page** - the current page object.
- **layout** - the current layout object.
- **param** - an array of URL parameters.

You can use the `this` variable to output the page title or description:

    <title>{{ this.page.title }}</title>
    <meta name="description" content="{{ this.page.description }}">

Another good idea is using the layout and page codes (the file name without extension) for generating the body CSS class names. The following example would generate class names like **page-home layout-default**.

    <body class="page-{{ this.page.id }} layout-{{ this.layout.id }}">
        ...
    </body>

The next example demonstrates how to access an URL parameter in a page:

    url = "/blog/post/:post_id"
    ==
    {% if this.param['post_id'] == 1 %}
        <p>This is the first post in the blog!</p>
    {% endif %}

<a name="page-links" class="anchor" href="#page-links"></a>
## Page links

October provides several Twig filters that help to generate links to pages and asset files. 

<a name="app-filter" class="anchor" href="#app-filter"></a>
### Link to a page relative to the application

The `|app` filter returns an absolute URL, including the domain name and protocol, to a page specified in the parameter. The next example would return a string like **http://example.com/about-us**:

    <a href="{{ '/about-us'|app }}">About Us</a>

<a name="page-filter" class="anchor" href="#page-filter"></a>
### Link to a page file name with reverse routing

The `|page` filter creates a link to a page using a page file name, without an extension, as a parameter. For example, if there is the about.htm page you can use the following code to generate a link to it:

    <a href="{{ 'about'|page }}">About Us</a>

Remember that if you refer a page from a [subdirectory](themes#subdirectories) you should specify the subdirectory name:

    <a href="{{ 'contacts/about'|page }}">About Us</a>

The reverse routing is built into the the `|page` filter. It allows you to provide URL parameters required for a page you refer. For example, if you want to create a link to a page post.htm that has the following URL pattern: */blog/post/:post_id* you need to provide the **post_id** parameter. You can do it with the page filter:

    <a href="{{ 'post'|page({post_id: 10}) }}">Blog post #10</a>

Another great feature of the reverse routing is the route parameter persisting. It sounds complicated, but in practice it's a simple concept. If a parameter is already presented in the environment, the `|page` filter will use it automatically. For example, if you are building a web application with the Preview Post (**/blog/post/preview/:post_id**) and Edit Post (**/blog/post/edit/:post_id**) pages and you want to create a link to the Edit Post from the Preview Post page you can do it like this:

    <a href="{{ 'post/edit'|page }}">Edit this post</a>

As you can see we don't need to specify the **post_id** parameter, because it is already known on the Preview page - it was loaded from the Preview Post page URL.

<a name="theme-filter" class="anchor" href="#theme-filter"></a>
## Links to asset files

Assets files reside in the **assets** subdirectory of a theme directory. October provides the `|theme` filter for creating links to assets files. The next example shows how to refer to a JavaScript file from the theme assets directory:

    <script type="text/javascript" src="{{ 'assets/js/menu.js'|theme }}"></script>

The `|theme` filter allows to combine assets of the same type on the fly by passing an array of files: 

    <link href="{{ ['assets/css/styles1.css', 'assets/css/styles2.css']|theme }}" rel="stylesheet">

You can enable the assets minification with the `enableAssetMinify` parameter in the `app/config/cms.php` script. By default the minification is disabled.

<a name="flash-messages" class="anchor" href="#flash-messages"></a>
## Flash messages

Flash messages can be set by [Components](components) or inside the page or layout [PHP section](themes#php-section) with the Flash class. Examples:

    Flash::success('Settings successfully saved!');
    ...
    Flash::error('Error saving settings');

October provides the `{% flash %}` tag for displaying Flash messages on the website pages. The tag has a closing tag - `{% endflash %}`. Everything between the opening and closing tags is displayed if the flash message is set. When the flash message is displayed it deletes from the session. Inside the `{% flash %}` you can use the `type` variable that represents the flash message type - **success**, **error**, **info** or **warning**. The `message` variable represents the flash message text.

    {% flash %}
        <div class="alert alert-{{ type }}">{{ message }}</div>
    {% endflash %}

The `{% flash %}` tag has an optional parameter that allows to filter flash messages of a given type. The next example will show only success messages. If there is an error message it won't be displayed.

    {% flash success %}
        <div class="alert alert-success">{{ message }}</div>
    {% endflash %}

<a name="forms" class="anchor" href="#forms"></a>
## Forms

October provides the `form_open()`, `form_ajax()` and `form_close()` functions that simplify creating the FORM tags. Using the functions is not necessary, but you may find that in many cases using the functions is simpler than listing all required attributes in the standard FORM tag. 

<a name="standard-form" class="anchor" href="#standard-form"></a>
### Opening the standard form

The next example shows several examples of opening a standard (non AJAX) form with different parameters:

    {{ form_open() }}

    {{ form_open({ class => 'form-horizontal' }) }}

    {{ form_open({ request: 'onUpdate' }) }}

The first parameter of the `form_open()` function accepts the option object. The function support the following options:

* **method** - request method. Eg: POST, GET, PUT, DELETE. Corresponds the **method** FORM tag attribute.
* **request** - a handler name to execute on the server when the form is posted. See the [Handling Forms](pages#handling-forms) article for details about the event handlers.
* **url** - specifies URL to post the form to - corresponds the **action** FORM tag attribute.
* **files** - determines whether the form will submit files. Accepted values: **true** and **false**.
* **model** - a model object for the form model binding.

<a name="ajax-form" class="anchor" href="#ajax-form"></a>
### Opening the AJAX form

The next example shows several examples of opening a AJAX form. The first parameter of the `form_ajax()` function is the AJAX handler name. The handler can be defined in the layout or page PHP [section](themes#php-section) or in a component. You may find more information about AJAX in the [AJAX Framework](ajax) article.

    {{ form_ajax('onUpdate') }}

    {{ form_ajax('onSave', { class => 'form-horizontal'}) }}

    {{ form_ajax('onDelete', { data: { id: 2 }, confirm: 'Really delete this record?' }) }}

    {{ form_ajax('onRefresh', { update: { statistics: '#statsPanel' } }) }}

The second parameter accepts the option object. The function supports the following options:

* **success** - JavaScript string to execute on successful result.
* **error** - JavaScript string to execute on failed result.
* **confirm** - a message to display to confirm before sending the request.
* **redirect** - on successful result, redirect to a URL.
* **update** - an array of partials to update on success in the following format: { 'partial': '#element' }.
* **data** - extra data to include with the request in the following format: { 'myvar': 'myvalue' }

<a name="styles-tag" class="anchor" href="#styles-tag"></a>
## Injecting CSS links

The `{% styles %}` tag inserts CSS links to files added by [components](../plugin/components#component-assets), or [pages](../cms/pages#injecting-assets). The tag is commonly defined in the HEAD section of a page or layout:

    <head>
        ...
        {% styles %}
    </head>

Another way to add styles to the `{% styles %}` tag is using the **styles**  anonymous [placeholder](../cms/layouts#placeholders). Use the `{% put %}` tag in pages or layouts to add content to the placeholder:

    {% put styles %}
        <link href="/themes/demo/assets/css/page.css" rel="stylesheet">
    {% endput %}

<a name="scripts-tag" class="anchor" href="#scripts-tag"></a>
## Injecting JavaScript scripts

The `{% scripts %}` tag inserts JavaScript file references to scripts added by [components](../plugin/components#component-assets), or [pages](../cms/pages#injecting-assets). The tag is commonly defined before the closing BODY tag:

    <body>
        ...
        {% scripts %}
    </body>

Another way to add scripts to the `{% scripts %}` tag is using the **scripts**  anonymous [placeholder](../cms/layouts#placeholders). Use the `{% put %}` tag in pages or layouts to add content to the placeholder:

    {% put scripts %}
        <script type="text/javascript" src="{{ 'assets/js/menu.js'|theme }}"></script>
    {% endput %}