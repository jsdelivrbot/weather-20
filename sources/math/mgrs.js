import MGRS from 'mgrs'

export function MGRSPretty (paramMGRS){
	let prettyMGRS = ''
	let parseMGRS = paramMGRS.split('')
	for(let parseMGRSIndex in parseMGRS){
		parseMGRSIndex = Number(parseMGRSIndex)
		prettyMGRS += parseMGRS[parseMGRSIndex]
		if((parseMGRSIndex+1)%5==0 && (parseMGRSIndex+1) !== parseMGRS.length)
			prettyMGRS += ' '
	}
	return prettyMGRS
}

export function EncodeMGRS(paramLat, paramLong){
	return MGRSPretty(MGRS.forward([paramLong, paramLat]))
}

export function DecodeMGRS(paramMgrs){
	let point = MGRS.toPoint(paramMgrs.split(' ').join(''))
	return [point[1], point[0]]
}