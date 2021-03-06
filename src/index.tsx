import React, {useState} from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK, locations } from 'contentful-ui-extensions-sdk';
import {Textarea, Button} from "@contentful/forma-36-react-components"
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';
import wiki from "wikijs"

const App = ({sdk}:Props) => {
  const [value, setValue] = useState(sdk.field.getValue())
  const [name, setName] = useState(sdk.entry.fields.name.getValue())
  const saveValue = (text:string|void) => {
    sdk.field.setValue(text).then(t => setValue(t))
  }

  const textMaxLength = 1000;

  sdk.window.startAutoResizer();
  console.log("test123");
  console.log(sdk);
  const onNameChanged = (text:any) => {
    if(text != name)
      setName(text)
  }

  sdk.entry.fields.name.onValueChanged(onNameChanged)


  const getWiki = (lang:string) =>{
    return wiki({ apiUrl: `https://${lang}.wikipedia.org/w/api.php` })
        .page(name)
        .then(res =>  res.summary())
        .then(summary => {
          if(summary.length < textMaxLength){
            return wiki({ apiUrl: `https://${lang}.wikipedia.org/w/api.php` })
                .page(name)
                .then(res =>  res.content())
                .then(content => {
                  let result = summary;
                  for (let i = 0; i < content.length-1 && result.length < textMaxLength; i++) {
                    result += `\n\n${content[i].title}\n${content[i].content}`
                  }
                  return result;
                })
          }
          return summary
        })
        .catch(err => console.log(err))
  }

  wiki().page("batman");

  const onClick = () => {
    Promise.all([
      getWiki("pl").catch(err => console.log(err)),
      getWiki("en").catch(err => console.log(err))])
        .then(([pl, en]) =>
    {
      if(!pl && !en){
        setValue("No page found on the wiki")
      } else{
        saveValue((!!pl) ? pl : en)
      }
    })
  }

  const onTextChanged = (text:string) => {
    if(text != value){
      saveValue(text);
    }
  }

  return(<>
    <Textarea rows={15} value={value} onChange={ (e) => onTextChanged(e.target.value)}/>
    <Button onClick={()=>onClick()}>{"Get from wiki"}</Button>
  </>);
};

interface Props{
  sdk: FieldExtensionSDK
}


init((sdk: FieldExtensionSDK) => {
  if (sdk.location.is(locations.LOCATION_DIALOG)) {
    render(<App sdk={sdk} />, document.getElementById('root'));
  } else {
    render(<App sdk={sdk} />, document.getElementById('root'));
  }
});


{/*// if (module.hot) {*/}
{/*//   module.hot.accept();*/}
{/*// }*/}
