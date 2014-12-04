# Component Development

- [Component class definition](#component-class-definition)
- [Component properties](#component-properties)
- [Routing parameters](#routing-parameters)
- [Handling the page execution cycle](#page-cycle)
- [AJAX handlers](#ajax-handlers)
- [Default markup](#default-markup)
- [Component partials](#component-partials)
- [Injecting page assets with components](#component-assets)

Components files and directories reside in the **/components** subdirectory of a plugin directory. Each component has a PHP file defining the component class and an optional component partials directory. The component partials directory name matches the component class name written in lowercase. An example of a component directory structure:

    plugins/
      acme/
        myplugin/
          components/
            componentname/      <=== Component partials directory
              default.htm       <=== Component default markup (optional)
            ComponentName.php   <=== Component class file
          Plugin.php

Components must be registered in the [Plugin registration file](registration#component-registration) with the `registerComponents()` method.

<a name="component-class-definition" class="anchor" href="#component-class-definition"></a>
## Component class definition

The **component class file** defines the component functionality and [component properties](#component-properties). The component class file name should match the component class name. Component classes should extend the `\Cms\Classes\ComponentBase` class. The component form the next example should be defined in the plugins/acme/blog/components/BlogPosts.php file.

    namespace Acme\Blog\Components;

    class BlogPosts extends Cms\Classes\ComponentBase
    {
        public function componentDetails()
        {
            return [
                'name' => 'Blog Posts',
                'description' => 'Displays a collection of blog posts.'
            ];
        }

        // This array becomes available on the page as {{ component.posts }}
        public function posts()
        {
            return ['First Post', 'Second Post', 'Third Third'];
        }
    }

The `componentDetails()` method is required. The method should return an array with two keys: `name` and `description`. The name and description are display in the CMS back-end user interface.

When this [component is attached to a page or layout](../cms/components), the class properties and methods become available on the page through the component variable, which name matches the component short name or the alias. For example, if the BlogPost component from the previous example was defined on a page with its short name:

    url = "/blog"

    [blogPosts]
    ==

You would be able to access its `posts()` method through the `blogPosts` variable. Note that Twig supports the property notation for methods, so that you don't need to use brackets.

    {% for post in blogPosts.posts %}
        {{ post }}
    {% endfor %}

<a name="component-properties" class="anchor" href="#component-properties"></a>
## Component properties

When you add a component to a page or layout you can configure it using using properties. The properties are defined with the `defineProperties()` method of the component class. The next example shows how to define a component property:

    public function defineProperties()
    {
        return [
            'maxItems' => [
                 'title'             => 'Max items',
                 'description'       => 'The most amount of todo items allowed',
                 'default'           => 10,
                 'type'              => 'string',
                 'validationPattern' => '^[a-zA-Z]*$',
                 'validationMessage' => 'The Max Items property can contain only Latin symbols'
            ]
        ];
    }

The method should return an array with the property keys as indexes and property parameters as values. The property keys are used for accessing the component property values inside the component class. The property parameters are defined with an array with the following keys:

* **title** - required, the property title, it is used by the component Inspector in the CMS back-end.
* **description** - required, the property description, it is used by the component Inspector in the CMS back-end.
* **default** - optional, the default property value to use when the component is added to a page or layout in the CMS back-end.
* **type** - optional, the default value is **string**. Specifies the property type. The type defines the way how the property is displayed in the Inspector. Currently supported types are **string**, **checkbox** and **dropdown**.
* **validationPattern** - optional Regular Expression to use when a user enters the property value in the Inspector. The validation can be used only with **string** properties.
* **validationMessage** - optional error message to display if the validation fails.
* **placeholder** - optional placeholder for string and dropdown properties.
* **options** - optional array of options for dropdown properties.
* **depends** - an array of property names a dropdown property depends on. See the [dropdown properties](#dropdown-properties) below.

Inside the component you can read the property value with the `property()` method:

    $this->property('maxItems');

If the property value is not defined, you can supply the default value as a second parameter of the `property()` method:

    $this->property('maxItems', 6);

You can also load all the properties as array:

    $properties = $this->getProperties();

<a name="dropdown-properties" class="anchor" href="#dropdown-properties"></a>
### Dropdown properties

The option list for dropdown properties can be static or dynamic. Static options are defined with the `options` element of the property definition.Example: 

    public function defineProperties()
    {
        return [
            'units' => [
                'title'             => 'Units',
                'type'              => 'dropdown',
                'default'           => 'imperial',
                'placeholder'       => 'Select units',
                'options'           => ['metric'=>'Metric', 'imperial'=>'Imperial']
            ]
        ];
    }

The list of options could be fetched dynamically from the server when the Inspector is displayed. If the `options` parameter is omitted in a dropdown property definition the option list is considered dynamic. The component class must define a method returning the option list. The method should have a name in the following format: `get*Property*Options()`, where **Property** is the property name, for example: `getCountryOptions`. The method returns an array of options with the option values as keys and option labels as values. Example of a dynamic dropdown list definition:

    public function defineProperties()
    {
        return [
            'country' => [
                'title'             => 'Country',
                'type'              => 'dropdown',
                'default'           => 'us'
            ]
        ];
    }

    public function getCountryOptions()
    {
        return ['us'=>'United states', 'ca'=>'Canada'];
    }

Dynamic drop-down lists can depend on other properties. For example, the state list could depend on the selected country. The dependencies are declared with the `depends` parameter in the property definition. The next example defines two dynamic dropdown properties and the state list depends on the country:

    public function defineProperties()
    {
        return [
            'country' => [
                'title'             => 'Country',
                'type'              => 'dropdown',
                'default'           => 'us'
            ],
            'state' => [
                'title'             => 'State',
                'type'              => 'dropdown',
                'default'           => 'dc',
                'depends'           => ['country'],
                'placeholder'       => 'Select a state'
            ]
        ];
    }

In order to load the state list you should know what country is currently selected in the Inspector. The Inspector POSTs all property values to the `getPropertyOptions()` handler, so you can do the following:

    public function getStateOptions()
    {
        $countryCode = Request::input('country'); // Load the country property value from POST

        $states = [
            'ca' => ['ab'=>'Alberta', 'bc'=>'British columbia'],
            'us' => ['al'=>'Alabama', 'ak'=>'Alaska']
        ];

        return $states[$countryCode];
    }

<a name="page-list-properties" class="anchor" href="#page-list-properties"></a>
### Page list properties

Sometimes components need to create links to the website pages. For example, the blog post list contains links to the blog post details page. In this case the component should know the post details page file name (then it can use the [page Twig filter](../cms/markup#page-filter)). October includes a helper for creating dynamic dropdown page lists. The next example defines the postPage property which displays a list of pages:

    public function defineProperties()
    {
            'postPage' => [
                'title' => 'Post page',
                'type'=>'dropdown',
                'default' => 'blog/post'
            ]
    }

    public function getPostPageOptions()
    {
        return Page::sortBy('baseFileName')->lists('baseFileName', 'baseFileName');
    }

<a name="routing-parameters" class="anchor" href="#routing-parameters"></a>
## Routing parameters

Components can access routing parameter values defined the [URL of the page](../cms/pages#url-syntax).

    $post_id = $this->param('post_id');

In some cases a [component property](#component-properties) may act as a hard coded value or reference the value from the URL.

This hard coded example shows the blog post with an identifier `2` being used:

    url = "/blog/hard-coded-page"

    [blogPost]
    id = "2"

Alternatively the value can be referenced dynamically from the page URL:

    url = "/blog/:my_custom_parameter"

    [blogPost]
    id = ":my_custom_parameter"

In both cases the value can be retrieved by using the `propertyOrParam()` method:

    $this->propertyOrParam('id');

<a name="page-cycle" class="anchor" href="#page-cycle"></a>
## Handling the page execution cycle

Components can be involved in the Page execution cycle events by overriding the `onRun()` method in the component class. The CMS controller executes this method every time when the page or layout loads. Inside the method you can inject variables to the Twig environment through the `page` property:

    public function onRun()
    {
        // This code will be executed when the page or layout is
        // loaded and the component is attached to it.

        $this->page['var'] = 'value'; // Inject some variable to the page
    }

<a name="page-cycle-handlers" class="anchor" href="#page-cycle-handlers"></a>
### Page execution life cycle handlers

When a page loads, October executes handler functions that could be defined in the layout and page [PHP section](../cms/themes#php-section) and component classes. The sequence the handlers are executed is following:

* Layout `onStart()` function.
* Layout components `onRun()` method.
* Layout `onBeforePageStart()` function.
* Page `onStart()` function.
* Page components `onRun()` method.
* Page `onEnd()` function.
* Layout `onEnd()` function.

<a name="ajax-handlers" class="anchor" href="#ajax-handlers"></a>
## AJAX handlers

Components can host AJAX event handlers. They are defined in the component class exactly like they can be defined in the [page or layout code](../cms/ajax#ajax-handlers). An example AJAX handler method defined in a component class:

    public function onAddItem()
    {
        $value1 = post('value1');
        $value2 = post('value2');
        $this->page['result'] = $value1 + $value2;
    }

If the alias for this component was *demoTodo* this handler can be accessed by `demoTodo::onAddItems`. Please see the [Calling AJAX handlers defined in components](../cms/ajax#components-ajax-handlers) article for details about using AJAX with components.

<a name="default-markup" class="anchor" href="#default-markup"></a>
## Default markup

All components can come with default markup that is used when including it on a page with the `{% component %}` tag, although this is optional. Default markup is kept inside the **component partials directory**, which has the same name as the component class in lower case.

The default component markup should be placed in a file named **default.htm**. For example, the default markup for the Demo ToDo component is defined in the file **/plugins/october/demo/components/todo/default.htm**. It can then be inserted anywhere on the page by using the `{% component %}` tag:

    url = "/todo"

    [demoTodo]
    ==
    {% component 'demoTodo' %}

The default markup can also take parameters that override the [component properties](#component-properties) at the time they are rendered.

    {% component 'demoTodo' maxItems="7" %}

These properties will not be available in the `onRun()` method since they are established after the page cycle has completed. Instead they can be processed by overriding the `onRender()` method in the component class. The CMS controller executes this method before the default markup is rendered.

    public function onRender()
    {
        // This code will be executed before the default component
        // markup is rendered on the page or layout.

        $this->page['var'] = 'Maximum items allowed: ' . $this->property('maxItems');
    }

<a name="component-partials" class="anchor" href="#component-partials"></a>
## Component partials

In addition to the default markup, components can also offer additional partials that can be used on the front-end or within the default markup itself. If the Demo ToDo component had a **pagination** partial, it Would be located in **/plugins/october/demo/components/todo/pagination.htm** and displayed on the page using:

    {% partial 'demoTodo::pagination' %}

<a name="referencing-self" class="anchor" href="#referencing-self"></a>
### Referencing "self"

Components can reference themselves inside their partials by using the `__SELF__` variable. By default it will return the component's short name or [alias](../cms/components#aliases).

    <form data-request="{{__SELF__}}::onEventHandler">
        [...]
    </form>

Components can also reference their own properties.

    {% for item in __SELF__.items() %}
        {{ item }}
    {% endfor %}

If inside a component partial you need to render another component partial concatenate the `__SELF__` variable with the partial name:

    {% partial __SELF__~"::screenshot-list" %}

<a name="unique-identifier" class="anchor" href="#unique-identifier"></a>
### Unique identifier

If an identical component is called twice on the same page, an `id` property can be used to reference each instance.

    {{__SELF__.id}}

The ID is unique each time the component is displayed.

    <!-- ID: demoTodo527c532e9161b -->
    {% component 'demoTodo' %}

    <!-- ID: demoTodo527c532ec4c33 -->
    {% component 'demoTodo' %}

<a name="component-assets" class="anchor" href="#component-assets"></a>
## Injecting page assets with components

Components can inject assets (CSS and JavaScript files) to pages or layouts they're attached to. Use the controller's `addCss()` and `addJs()` methods to add assets to the CMS controllers. It could be done in the component's `onRun()` method. Please read more details about [injecting assets in the Pages article](../cms/page#injecting-assets). Example:

    public function onRun()
    {
        $this->addJs('/plugins/acme/blog/assets/javascript/blog-controls.js');
    }

If the path specified in the `addCss()` and `addJs()` method argument begins with a slash (/) then it will be relative to the website root. If the asset path does not begin with a slash then it is relative to the component directory.
