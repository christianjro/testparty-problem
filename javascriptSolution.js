var input2 = '"<View style=\"{\n  \"flex\": 1,\n  \"backgroundColor\": \"#fff\",\n  \"alignItems\": \"center\",\n  \"justifyContent\": \"center\"\n}\" accessibilityActions=\"[\n  {\n    \"name\": \"cut\",\n    \"label\": \"cut\"\n  }\n]\" testparty-id=\"b0c8264b-cce2-4379-b194-5f02d6b0f9f5\"><Text testparty-id=\"c2f33be7-f720-4939-b08c-bc35943f3322\">Open up App.tsx to start working on your app!</Text><Image source=\"{\n  \"uri\": \"https://reactjs.org/logo-og.png\"\n}\" style=\"{\n  \"width\": 400,\n  \"height\": 400\n}\" accessible=\"true\" testparty-id=\"2b3fbd94-3072-47df-bf49-820adff38335\"></Image><Image source=\"{\n  \"uri\": \"https://reactjs.org/logo-og.png\"\n}\" style=\"{\n  \"width\": 400,\n  \"height\": 400\n}\" accessible=\"true\" testparty-id=\"855bb15a-9b5f-4e2d-92d1-4fd286073c71\"></Image><ExpoStatusBar style=\"auto\" testparty-id=\"3f053115-ea55-450a-9d3b-2b2ccc3f8591\"></ExpoStatusBar></View>"';

function parseComponent(component) {
    var openingTagEnd = component.indexOf('>');
    var closingTagStart = component.lastIndexOf('<');

    var componentString = component.substring(1, openingTagEnd);
    var componentName = componentString.split(" ")[0].substring(1, componentString.length);

    var componentPropertiesString = componentString.indexOf(' ') === -1 ? "" : componentString.substring(componentString.indexOf(' ') + 1, openingTagEnd - 1);
    var componentProperties = parseProperties(componentPropertiesString);

    var childrenString = component.substring(openingTagEnd + 1, closingTagStart);
  
    var componentChildren = childrenString ? parseChildren(childrenString) : null;
    var componentText = childrenString.indexOf('<') === -1 ? childrenString : undefined;
    return {
        name: componentName,
        properties: componentProperties,
        text: componentText,
        children: componentChildren,
        ...(componentName === "Image" ? { isImage: true} : {})
    };
}
function parseChildren(childrenString, childComponents) {
    if (childComponents === void 0) { childComponents = []; }
    var openTags = 0;
    var start = 0;
    for (var i = 0; i < childrenString.length; i++) {
        if (childrenString[i] === '<' && childrenString[i + 1] !== '/') {
            if (openTags === 0) {
                start = i;
            }
            openTags++;
        }
        else if ((childrenString[i] === '>' || childrenString[i] === " ") && openTags === 1) {
            var componentName = childrenString.substring(start + 1, i);
            var componentIdxStart = childrenString.indexOf(componentName) - 1;
            var componentIdxEnd = childrenString.lastIndexOf(componentName) + componentName.length + 1;
            var currentComponent = '"' + childrenString.substring(componentIdxStart, componentIdxEnd);
            openTags--;
            if (openTags === 0) {
                childComponents.push(parseComponent(currentComponent));
                parseChildren(childrenString.substring(componentIdxEnd - 1, childrenString.length), childComponents);
            }
            break;
        }
    }
    return childComponents;
}
function parseProperties(inputString) {
    var keyValuePairs = {};
    var i = 0;
    while (i < inputString.length) {
        var equalSignIdx = inputString.indexOf('=', i);
        if (equalSignIdx === -1) {
            break;
        }
        var keyStartIdx = i;
        var keyEndIdx = equalSignIdx;
        var key = inputString.substring(keyStartIdx, keyEndIdx).trim();
        var nextEqualSignIdx = inputString.indexOf("=", equalSignIdx + 1);
        var valueEndIdx = void 0;
        if (nextEqualSignIdx !== -1) {
            valueEndIdx = inputString.lastIndexOf(" ", nextEqualSignIdx);
        }
        else {
            valueEndIdx = inputString.length;
        }
        var value = inputString.substring(equalSignIdx + 1, valueEndIdx).replaceAll('"', "").replaceAll("\n", "").replaceAll(" ", "");
        var cleanedValue = parsePropertyValue(value);
        keyValuePairs[key] = cleanedValue;
        i = valueEndIdx;
    }
    return keyValuePairs;
}
function parsePropertyValue(value) {
    if (value.startsWith('"') && value.endsWith('"')) {
        return value.substring(1, value.length - 1);
    }
    else if (value.startsWith('{')) {
        var obj_1 = {};
        var properties = value.substring(1, value.length - 1).split(',');
        properties.forEach(function (property) {
            var _a = property.split(':'), key = _a[0], value = _a[1];
            obj_1[key] = parsePropertyValue(value);
        });
        return obj_1;
    }
    else if (value.startsWith('[')) {
        var arr_1 = [];
        var properties = value.substring(1, value.length - 1).split(" ");
        properties.forEach(function (property) {
            arr_1.push(parsePropertyValue(property));
        });
        return arr_1;
    }
    else {
        return value;
    }
}
function parseObjectToString(obj) {
    var result = '<' + obj.name;
    if (obj.properties && Object.keys(obj.properties).length > 0) {
        var properties = propertyValueToString(obj.properties);
        result += " ".concat(properties);
    }
    result += '>';
    if (obj.text !== undefined) {
        result += obj.text;
    }
    if (obj.children && obj.children.length > 0) {
        result += obj.children.map(function (child) { return parseObjectToString(child); }).join('');
    }
    result += '</' + obj.name + '>';
    return result;
}
function propertyValueToString(obj, propertiesString) {
    if (propertiesString === void 0) { propertiesString = ""; }
    if (obj) {
        Object.entries(obj).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (typeof value === 'string') {
                propertiesString += "".concat(key, "=\"").concat(value, "\" ");
            }
            else if (typeof value === 'object') {
                propertiesString += "".concat(key, "=\"").concat(JSON.stringify(value), " ");
            }
            else if (Array.isArray(value)) {
                value.forEach(function (item) {
                    propertiesString += propertyValueToString(item);
                });
            }
        });
    }
    return propertiesString.trim();
}
var parsedComponent = parseComponent(input2);
console.log(parsedComponent);
// console.log(parsedComponent.children[0].children[0])
console.log(parseObjectToString(parsedComponent));
// console.log(" ")
// console.log(input2)
