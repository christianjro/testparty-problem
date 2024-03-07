const input2 = '"<View style=\"{\n  \"flex\": 1,\n  \"backgroundColor\": \"#fff\",\n  \"alignItems\": \"center\",\n  \"justifyContent\": \"center\"\n}\" accessibilityActions=\"[\n  {\n    \"name\": \"cut\",\n    \"label\": \"cut\"\n  }\n]\" testparty-id=\"b0c8264b-cce2-4379-b194-5f02d6b0f9f5\"><Text testparty-id=\"c2f33be7-f720-4939-b08c-bc35943f3322\">Open up App.tsx to start working on your app!</Text><Image source=\"{\n  \"uri\": \"https://reactjs.org/logo-og.png\"\n}\" style=\"{\n  \"width\": 400,\n  \"height\": 400\n}\" accessible=\"true\" testparty-id=\"2b3fbd94-3072-47df-bf49-820adff38335\"></Image><Image source=\"{\n  \"uri\": \"https://reactjs.org/logo-og.png\"\n}\" style=\"{\n  \"width\": 400,\n  \"height\": 400\n}\" accessible=\"true\" testparty-id=\"855bb15a-9b5f-4e2d-92d1-4fd286073c71\"></Image><ExpoStatusBar style=\"auto\" testparty-id=\"3f053115-ea55-450a-9d3b-2b2ccc3f8591\"></ExpoStatusBar></View>"'

type PropertyValue = string | PropertyObj | PropertyObj[]

type PropertyObj = {
 [key: string]: PropertyValue
}

type ComponentObj = {
  name: string,
  properties?: PropertyObj | undefined,
  text: string | undefined,
  children: ComponentObj[] | null
}

function parseComponent(component: string) {
  const openingTagEnd = component.indexOf('>');
  const closingTagStart = component.lastIndexOf('<');

  const componentString = component.substring(1, openingTagEnd);
  const componentName = componentString.split(" ")[0].substring(1, componentString.length)

  const componentPropertiesString = componentString.indexOf(' ') === -1 ? "" : componentString.substring(componentString.indexOf(' ') + 1, openingTagEnd - 1)
  const componentProperties = parseProperties(componentPropertiesString)

  const childrenString = component.substring(openingTagEnd + 1, closingTagStart);
  const componentChildren = childrenString ? parseChildren(childrenString) : null

  const componentText = childrenString.indexOf('<') === -1 ? childrenString : undefined

  return {
    name: componentName,
    properties: componentProperties,
    text: componentText,
    children: componentChildren,
  };
}

function parseChildren(childrenString: string, childComponents: ComponentObj[] = []) {
  let openTags = 0;
  let start = 0;

  for (let i = 0; i < childrenString.length; i++) {
    if (childrenString[i] === '<' && childrenString[i + 1] !== '/') {
      if (openTags === 0) {
        start = i
      }
      openTags++;
    } else if ((childrenString[i] === '>' || childrenString[i] === " ") && openTags === 1) {
      const componentName = childrenString.substring(start + 1, i)
      const componentIdxStart = childrenString.indexOf(componentName) - 1
      const componentIdxEnd = childrenString.lastIndexOf(componentName) + componentName.length + 1
      const currentComponent = '"' + childrenString.substring(componentIdxStart, componentIdxEnd)
      openTags--;

      if (openTags === 0) {
        childComponents.push(parseComponent(currentComponent))
        parseChildren(childrenString.substring(componentIdxEnd - 1, childrenString.length), childComponents)
      }

      break
    }
  }
  return childComponents;
}

function parseProperties(inputString: string) {
  const keyValuePairs: PropertyObj = {}

  let i = 0
  while (i < inputString.length) {
    const equalSignIdx = inputString.indexOf('=', i)
    if (equalSignIdx === -1) {
      break
    }
    const keyStartIdx = i
    const keyEndIdx = equalSignIdx
    const key = inputString.substring(keyStartIdx, keyEndIdx).trim()

    const nextEqualSignIdx = inputString.indexOf("=", equalSignIdx + 1)

    let valueEndIdx
    if (nextEqualSignIdx !== -1) {
      valueEndIdx = inputString.lastIndexOf(" ", nextEqualSignIdx)
    } else {
      valueEndIdx = inputString.length
    }

    const value = inputString.substring(equalSignIdx + 1, valueEndIdx).replaceAll('"', "").replaceAll("\n", "").replaceAll(" ", "")
    const cleanedValue = parsePropertyValue(value)

    keyValuePairs[key] = cleanedValue

    i = valueEndIdx
  }
  return keyValuePairs
}

function parsePropertyValue(value: string) {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.substring(1, value.length - 1);
  } else if (value.startsWith('{')) {
    const obj: any = {}
    const properties = value.substring(1, value.length - 1).split(',')

    properties.forEach((property) => {
      const [key, value] = property.split(':')
      obj[key] = parsePropertyValue(value)
    })
    return obj
  } else if (value.startsWith('[')) {
    const arr: any[] = []
    const properties = value.substring(1, value.length - 1).split(" ")

    properties.forEach((property) => {
      arr.push(parsePropertyValue(property))
    })
    return arr
  } else {
    return value;
  }
}

function parseObjectToString(obj: ComponentObj) {
  let result = '<' + obj.name

  if (obj.properties && Object.keys(obj.properties).length > 0) {
    const properties = propertyValueToString(obj.properties)
    result += ` ${properties}`
  }

  result += '>'

  if (obj.text !== undefined) {
    result += obj.text
  }
  if (obj.children && obj.children.length > 0) {
    result += obj.children.map(child => parseObjectToString(child)).join('')
  }
  result += '</' + obj.name + '>'

  return result
}

function propertyValueToString(obj: PropertyObj, propertiesString: string = "") {
  if(obj) {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string') {
        propertiesString += `${key}="${value}" `
      }
      else if (typeof value === 'object') {
        propertiesString += `${key}="${JSON.stringify(value)} `
      }
      else if (Array.isArray(value)) {
        (value as PropertyObj[]).forEach(item => {
          propertiesString += propertyValueToString(item)
        })
      }
    })
  }
  return propertiesString.trim()
}


const parsedComponent = parseComponent(input2);
console.log(parsedComponent);
// console.log(parsedComponent.children[0].children[0])
console.log(parseObjectToString(parsedComponent))
// console.log(" ")
// console.log(input2)
