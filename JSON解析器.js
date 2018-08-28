function JSON_parse(json) {
	for (let i = 0; i < json.length; i++) {
		if (json[i] === " ") continue
		if (json[i] === "[") return json_Array(json.slice(i + 1,json.length - 1))
		if (json[i] === "{") return json_Object(json.slice(i + 1,json.length - 1))
		if (json[i] === "t") return json_Boolean(json.slice(i,json.length),"true")
		if (json[i] === "f") return json_Boolean(json.slice(i,json.length),"false")
		if (json[i] === "n") return json_Boolean(json.slice(i,json.length),"null")
		if (json[i] === '"') return json_String(json.slice(i + 1,json.length - 1))
		if (/[0-9]/.test(json[i]) || json[i] === "-") return json_Number(json.slice(i,json.length))
		throw new Error("JSON解析异常")
	}
}

function json_Array(str) {
	let ary = [], Booleanval = {"t":"true","f":"false","n":"null"}
	for (let i = 0; i < str.length; i++) {
		let grammarjudge = 0
		while (str[i] === " " || str[i] === ",") {
			if (str[i] === ",") grammarjudge++
			if (grammarjudge > 1) throw new Error("JSON解析异常(参数错误:含有多余逗号) :" + str)
			i++
		}
		let j = i
		if (str[i] === '"') {
			j = i + 1, strval = ""
			while (str[j] != '"') {
				strval+= str[j]
				j++
			}
			ary.push(strval)
		} else if (str[i] === "[") {
				j = i, count = 1
				while (count != 0) {
					j++
					if (str[j] === "[") count++
					if (str[j] === "]") count--
				}
				ary.push(json_Array(str.slice(i + 1,j)))
		} else if (str[i] === "{") {
				j = i, count = 1
				while (count != 0) {
					j++
					if (str[j] === "{") count++
					if (str[j] === "}") count--
				}
				ary.push(json_Object(str.slice(i + 1,j)))
		} else if (/[0-9\-]/.test(str[i])) {
				j = i, val = ""
				while (/[0-9\-\.]/.test(str[i])) {
					j++
				}
				ary.push(json_Number(str.slice(i,j)))
		} else if (Booleanval.hasOwnProperty(str[i])) { 
				j = i, val = ""
				while (str[j] != "," && str[j] != "]") {
					j++
				}
				ary.push(json_Boolean(str.slice(i,j),Booleanval[str[i]]))
		} else throw new Error("JSON解析异常(参数错误:含有非法参数) :" + str)
			i = j
	}
	return ary
}

function json_Object(str) {
	let obj = {}, Booleanval = {"t":"true","f":"false","n":"null"}
	for (let i = 0; i < str.length; i++) {
		let j, k = i
		if (str[i] === " ") continue
		if (str[i] === ",") {
			i = i + 1
			while (str[i] === " ") i++
			if (str[i] === ",") throw new Error("JSON解析异常(参数错误:含有多余逗号) :" + str)
		}
		if (str[i] === '"') {
			j = i + 1, strval = ""
			while (str[j] != '"') {
				strval+= str[j]
				j++
			}
			j = j + 1
			let grammarjudge = 0
			while (str[j] === " " || str[j] === ":") {
				if (str[j] === ":") grammarjudge++
				if (grammarjudge > 1) throw new Error("JSON解析异常(参数错误:含有多余冒号) :" + str)
				j++
			}
			if (grammarjudge === 0) throw new Error("JSON解析异常(参数错误:含有无键值属性) :" + str)
			if (str[j] === "[") {
				k = j, count = 1
				while (count != 0) {
					k++
					if (str[k] === "[") count++
					if (str[k] === "]") count--
				}
				obj[strval] = json_Array(str.slice(j + 1,k))
			} else if (str[j] === "{") {
				k = j, count = 1
				while (count != 0) {
					k++
					if (str[k] === "{") count++
					if (str[k] === "}") count--
				}
				obj[strval] = json_Object(str.slice(j + 1,k))
			} else if (str[j] === '"') {
				k = j + 1, string = ""
				while (str[k] != '"') {
					string+= str[k]
					k++
				}
				obj[strval] = string
			} else if (/[0-9\-]/.test(str[j])) {
				k = j, val = ""
				while (/[0-9\-\.]/.test(str[k])) {
					k++
				}
				obj[strval] = json_Number(str.slice(j,k))
			} else if (Booleanval.hasOwnProperty(str[j])) { 
					k = j, val = ""
					while (str[k] != "," && str[k] != "]") {
						k++
					}
					obj[strval] = json_Boolean(str.slice(j,k),Booleanval[str[j]])
			} else throw new Error("JSON解析异常(参数错误:含有非法参数) :" + str)
			i = k
		}
	}
	return obj
}

function json_String(str) {
	return str
}

function json_Boolean(str,Bol) {
	let len = (Bol === "true") || (Bol === "null") ? 4 : 5
	if (str.slice(0,len) != Bol) throw new Error("JSON解析异常(Boolean值错误)")
	for (let i = len; i < str.length; i++) {
		if (str[i] != " ") throw new Error("JSON解析异常(Boolean值错误)")
	}
	return Bol === "true" ? true : (Bol === "false" ? false : null)
}

function json_Number(str) {
	let strval = "", str1 = str
	if (/\./.test(str)) {               //如果有小数点，那么小数点出现次数不能超过两次
		if (str.match(/\./g).length > 1) throw new Error("JSON解析异常(数值错误) :" + str1)
	}
	if (str[str.length - 1] === ".") throw new Error("JSON解析异常(数值错误) :" + str1)
	//如果有小数点，那么小数点不能出现在最后一位
	if (str[0] === "-") {
		strval = "-"
		str = str.slice(1)
	}
	if (str[0] === "0") { //如果首位是0且长度超过1的时候，第二位不是“.”，则抛出错误
		if (str.length > 1 && str[1] != ".")  throw new Error("JSON解析异常(数值错误) :" + str1)
	}
	for (let i = 0; i < str.length; i++) {
		if (!/[0-9]/.test(str[i]) && str[i] != ".") throw new Error("JSON解析异常(数值错误) :" + str1)
		strval += str[i]
	}
	return strval - 0
}