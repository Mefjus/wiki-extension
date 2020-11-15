import React, {useState} from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK, locations } from 'contentful-ui-extensions-sdk';
import {Textarea, Button} from "@contentful/forma-36-react-components"
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';


const App = ({sdk}:Props) => {
  const [value, setValue] = useState(sdk.field.getValue())
  const [name, setName] = useState(sdk.entry.fields.name.getValue())
  const saveValue = (text:string|void) => {
    sdk.field.setValue(text).then(t => setValue(t))
  }

  sdk.window.startAutoResizer();

  console.log(sdk);
  const onNameChanged = (text:any) => {
    if(text != name)
      setName(text)
  }

  sdk.entry.fields.name.onValueChanged(onNameChanged)


  const onClick = () => {
    Promise.all([
      fetch(`https://pl.wikipedia.org/w/api.php?format=json&action=query&redirects=&prop=extracts&explaintext=&exintro=&titles=${name}&origin=*`)
          .then(res => res.json())
          .then(res => {
                const id = Object.keys(res.query.pages)[0];
                if (!id || id === '-1') {
                  throw new Error('No article found');
                }
                return res.query.pages[id].extract})
          .catch(err => console.log(err))
      ,
      fetch(`https://en.wikipedia.org/w/api.php?format=json&action=query&redirects=&prop=extracts&explaintext=&exintro=&titles=${name}&origin=*`)
          .then(res => res.json())
          .then(res => {
            const id = Object.keys(res.query.pages)[0];
            if (!id || id === '-1') {
              throw new Error('No article found');
            }
            return res.query.pages[id].extract})
          .catch(err => console.log(err))
        ]).then(([pl, en]) =>
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
