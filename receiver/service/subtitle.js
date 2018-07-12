import Logger from '../../logger.js'

export default function SubtitleWrite(app, database) {
	app.post(`/api/subtitle`, (request, response)=>{
		global.Metadata.metadata.get(`subtitle`, (isSuccess, subtitleData)=>{
			if(subtitleData === null || subtitleData === undefined)
				subtitleData = []
			response.send(subtitleData)
			response.end()
		})
	})
}