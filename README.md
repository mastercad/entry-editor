# Entry Editor

- [Entry Editor](#entry-editor)
  - [Beschreibung](#beschreibung)
  - [Konfiguration:](#konfiguration)
  - [Anwendung](#anwendung)
    - [Standalone](#standalone)
    - [Webpack](#webpack)
  - [Beispiele](#beispiele)

## Beschreibung

Entry Editor ermöglicht es auf einfache art eine editierbare liste zu erstellen und diese liste mit hilfe des local storages von javascript möglichst userfreundlich zu verwalten. hinterlegte values werden so lange im local storage vorgehalten, bis die form gespeichert wird. stürzt der browser ab oder wird die seite neu geladen, bevor man abgespeichert hat, wird die form über die daten aus dem local storage erneut befüllt.

## Konfiguration:

```javascript
let config = {
    'selector' => '#root',
    'title' => 'Entry List Title',
    'header' => [
        {
            'class' => 'css-style-class1 css-style-class2', #css classes for html element
            'style' => 'background-color: #CCCCCC, font-size: 12px;', # css style for html element,
            'id' => 'entry_element_id', # id for html element,
            'data-type' => 'text_type' # user defined attributes for html element
        },
        {
            ...
        }
    ]
}
```

`config.selector` representiert den identifier für den Container, welcher die entry liste enthält oder enthalten wird (hierbei muss es sich um ein Div Element handeln)

`config.app` es ist auch möglich dass statt einem selector ein bereits vorhandenes element als objekt übergeben wird, dabei muss es sich um ein HTMLDivElement handeln

`config.title` titel der entry liste

`config.header` config array mit eventuellen css klassen, css styles oder sonstige html attribute der spalten der entry liste, welche generiert werden sollen oder bereits bestehen, mögliche keys sind:
- class
- style
- attributes
- frei definierbare attribute wie `data-id`, `id`, `name`, `type`, `placeholder`, und so weiter.

`config.data` enthält die daten, die bereits bekannt sind und beim erstellen der entry liste in das value attribut des input feldes gesetzt wird. dabei ist der key analog zum column namen im header

## Anwendung

### Standalone

source einbinden
```html
<script type="text/javascript" language="javascript" src=""></script>
```

### Webpack

packet installieren
```shell
npm install @byte-artist/entry-editor
```

assets bilden für dev
```shell
yarn encore dev

npm run dev
```

oder assets bilden für production
```shell
yarn encore production

npm run build
```

webpack konfigurieren
```javascript
// webpack.config.js
...
.addEntry('entry-editor', './node_modules/@byte-artist/entry-editor/dist/EntryEditor.js')
...
```

generierte script pfade einbinden (hier als Beispiel in der base.html.twig)
```twig
{# base.html.twig #}
{{ encore_entry_script_tags('entry-editor') }}
```

## Beispiele

```html
        <div id="root"></div>

        <script>
            document.addEventListener('DOMContentLoaded', function() {
                var elem = document.getElementById('root');

                let config = {
                    header: [
                        {
                            name: "TestName",
                            type: "text",
                            placeholder: "Name:"
                        },
                        {
                            name: "TestPassword",
                            type: "password",
                            placeholder: "Password:"
                        },
                        {
                            name: "id",
                            type: "hidden"
                        }
                    ],
                    data: [
                        {
                            TestName: "name",
                            TestPassword: "password",
                            id: 1
                        },
                        {
                            TestName: "name1",
                            TestPassword: "password1",
                            id: 2
                        },
                        {
                            TestName: "name2",
                            TestPassword: "password2",
                            id: 3
                        }
                    ]
                };

                let instance = new EntryEditor(config);
            });
        </>
```
