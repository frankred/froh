Froh is an easy to use, data oriented and component based javascript frontend framework.

## Beginner tutorial

### 1) The key-value store
You can save `Froh.set('key', obj)` every kind of data. And you can fetch that data `Froh.get('key')` from anywhere in your whole project.
The main feature of this framework is that you can also listen on changes of that object, no matter how deep that change happens.

#### Example

```
Froh.set('serverlist', ['http://google.com', 'http://web.com', 'http://rothf.de']);

Froh.on('serverlist', function(){
    console.log('Serverlist has been changed');
}

Froh.get('serverlist')[1] = 'http://facebook.com';
// console out: Serverlist has been changed
```
Now every change on that object will be tracked and the cb function will be called. 


### 2) Create a component
First of all you can write a Froh component that has to implement the function `html()`. 
This function will be called by a `render()` method automatically to redraw your defined component if you want so.
```
class WebsiteList extends FrohComponent {
    html() {
        return `<ul><li>${(Froh.get('websites') || []).join(`</li><li>`)}</li></ul>`;
    }
}
```

### 3) Froh.ready()
Wait for Froh to be ready, you know that from jQuery...
```
 Froh.ready(function () {
    ...
 }
```

### 3) Go for it
Instantiate your component and attach your data to the Froh storage.  
With `Froh.on(...)` you can add a listener function that will be called every time when the value of the key will be modified or overwritten.
Your ```FrohComponent``` also needs a place within the html document. If you pass a tag, or just the tagname of that html element Froh automatically shows the component within that html tag.


```
<!doctype html>
<html lang="en">
<head>
    <title>Title</title>
    <script type="application/javascript" src="Froh.js"></script>
    <script type="application/javascript">
    
         class WebsiteList extends FrohComponent {
          html() {
            return `<ul><li>${(Froh.get('websites') || []).join(`</li><li>`)}</li></ul>`;
          }
        }
        
        Froh.ready(function () {
            var websites = new WebsiteList('<websites>');

            Froh.set('websites', ['http://google.de', 'http://amazon.de', 'http://myapp.js']);
            Froh.on('websites', function(){
                websites.render();
            });
            
            // Every modification on the stored object 'websites' will trigger the rerendering.
            Froh.get('websites')[1] = 'http://web.de';
        });
    </script>
</head>
<body>
<websites/>
</body>
</html>
```
