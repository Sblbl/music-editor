let isTouchDevice = !!('ontouchstart' in window)
let svgRoot = $('svg')[0] 
const  xlinkns = "http://www.w3.org/1999/xlink";
const  svgns = "http://www.w3.org/2000/svg";

let play = false
let bpm = 120
let loop = true

const straightSegmentLength = 5
let numberOfBeatsPerPhrase = 4
let beatDuration = 60 / bpm

let currentPattern = 0

//MUSICAL-COMPONENTS
let semitoneList = [ 'C', 'Cplus', 'D', 'Dplus', 'E', 'F', 'Fplus', 'G', 'Gplus', 'A', 'Aplus', 'B' ]
let scaleList = {
	major		: [ 2, 2, 1, 2, 2, 2 ], 
	minor		: [ 2, 1, 2, 2, 1, 2 ],
	dorian		: [ 2, 1, 2, 2, 2, 1 ],
	phrygian	: [ 1, 2, 2, 2, 1, 2 ],
	lydian		: [ 2, 2, 2, 2, 1, 2 ],
	mixolydian 	: [ 2, 2, 1, 2, 2, 1 ],
	locrian 	: [ 1, 2, 2, 1, 2, 2 ],
	arabian 	: [ 1, 3, 1, 2, 1, 3 ],
	oriental 	: [ 1, 3, 1, 1, 3, 1 ],
	enigmatic	: [ 1, 3, 2, 2, 2, 1 ],
	bebop 		: [ 2, 2, 1, 2, 2, 1, 1 ],
	gypsy		: [ 2, 1, 3, 1, 1, 2, 1],
	pentatonic 	: [ 2, 2, 3, 2 ],
	chromatic 	: [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ]

}

//INTERFACE-ELEMENTS
let $_defs = $('defs')
let $_editingArea = $('#editing-area')
let $_anchorSettingsButton = $('#anchor-settings-button')
let $_anchorSettingsMenu = $('#anchor-settings-menu')
let $_anchorSheetX = $('#anchor-sheet-x-button')
let $_anchorSheetY = $('#anchor-sheet-y-button')
let $_anchorDrawingX = $('#anchor-drawing-x-button')
let $_anchorDrawingY = $('#anchor-drawing-y-button')
let $_newSheetButton = $('#new-sheet-button')
let $_changeViewCursor = $('#view-mode-cursor')
let $_changeBpmCursor = $('#change-bpm-cursor')
let $_changePartialsCursor = $('#change-partials-cursor')
let $_changeVolumeCursor = $('#change-volume-cursor')
let $_clearAllButton = $('#clear-all-button')
let $_playBar = $('#play-bar')
let $_levelsGroup = $('#levels-group')
let $_hideLevelButton = $('.hide-level-button')
let $_lockLevelButton = $('.lock-level-button')
let $_stopButton = $('#stop-button')
let $_scaleSettingsButton = $('#scale-settings-button')
let $_scaleSettingsMenu = $('#scale-settings-menu')
let $_scaleChoiceMenu = $('#scale-choice-menu')
let $_octaveCursorContent = $('#octave-cursor-content')
let $_ghostSheet = $('#ghost-sheet')
let $_soundDeleteCursor = $('#sound-delete-cursor')

//SHEET-ELEMENTS
let $_sheetFrame = $('#sheet-frame')
let $_sheetDeleteButton = $('#sheet-delete-button') 
let $_sheetTransformButton = $('#sheet-transform-button') 
let $_sheetDuplicateButton = $('#sheet-duplicate-button')

let $_codeEditorTransformButton = $('#code-editor-transform-button') 

let $_soundFreeDrawButton = $('#sound-free-draw')
let $_soundStraightDrawButton = $('#sound-straight-draw')
let $_codeEditorButton = $('#code-editor-button')
let $_soundDeleteLineButton = $('#sound-delete-line')

let $_sheetSettingsButton = $('#sheet-settings-button')
let $_sheetSettingsMenu = $('#sheet-settings-menu')
let $_soundDrawGroup = $('#sound-draw-group')
let $_soundDrawMenu = $('#sound-draw-menu')
let $_sineButton = $('#sine-button')
let $_squareButton = $('#square-button')
let $_triangleButton = $('#triangle-button')
let $_sawtoothButton = $('#sawtooth-button')

//FUNCTIONS

uniqueEvent = function(e){
	if(isTouchDevice) {
		e.x = e.touches[0].pageX;
		e.y = e.touches[0].pageY;
	} else {
		e.x = e.pageX;
		e.y = e.pageY;
	}
	return e;
}

function findSVGCoords(e, matrix, point, offsetX, offsetY){
	matrix = matrix || svgRoot.getScreenCTM();
	point = point || svgRoot.createSVGPoint();
	offsetY = offsetY || $(window).scrollTop();
	offsetX = offsetX || $(window).scrollLeft();
	point.x = e.x - offsetX;
	point.y = e.y - offsetY;// - $_editingArea.attr('data-y');
	point = point.matrixTransform(matrix.inverse());
	return point;
}


function map(value, start1, stop1, start2, stop2) {
	return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}


//DEFAULT CODE EDITOR CONST
const editingAreaWidth = 800
const editingAreaHeight = 665
const numberOfPhrases = 8
const editorHeight = editingAreaHeight
const semitoneHeight = 17.5
const seminoteConst = Math.pow(2,1/12)


//DEFAULT CODE EDITOR FUNCTIONS
let sineWave
let straightLine
let newSheet
let updateMusicData
let updateTime

//CODE EDITOR ACCESSIBLE DATA
let numberOfSheets = 0
let beatWidth = editingAreaWidth / numberOfPhrases / numberOfBeatsPerPhrase
let minFrequency = 123.47
let sheetWidth 
let sheetHeight


//DOCUMENT-READY FUNCTIONS
jQuery(document).ready(function($){

	let sheetList = []

	function createSheet (x, y) {

		numberOfSheets ++

		if ( x > editingAreaWidth - 200) x = editingAreaWidth - 200
		if ( y > editingAreaHeight - 120) y = editingAreaHeight - 120

		let $_sheetGroup = $(document.createElementNS(svgns, 'g'))
			$_sheetGroup.addClass('sheet-group current')
			$_sheetGroup.attr('transform', `translate(${x},${y})`)
			$_sheetGroup.attr('instrument', 'sine')
			$_sheetGroup.attr('data-x', x)
			$_sheetGroup.attr('data-y', y)
			$_sheetGroup.attr('data-partials', 2)
			$_sheetGroup.attr('data-volume', -20)
		$_editingArea.append($_sheetGroup)
		let sheet = document.createElementNS(svgns, 'rect') 
			sheet.setAttribute('class', 'sheet')
			sheet.setAttribute('id', `sheet-${numberOfSheets}`)
			sheet.setAttribute('width', '200px')
			sheet.setAttribute('height', '120px')
		$_sheetGroup.append(sheet)
		let sheetGroupContent = document.createElementNS(svgns, 'g')
			sheetGroupContent.setAttribute('class', 'sheet-group-content')
			sheetGroupContent.setAttribute('id', `sheet-${numberOfSheets}-content`)
			$_sheetGroup.append(sheetGroupContent)
		let mask = document.createElementNS(svgns, 'clipPath')
			mask.setAttribute('id', `sheet-${numberOfSheets}-mask`)
			$_defs.append(mask)
		let use = document.createElementNS(svgns, 'use')
			use.setAttributeNS(xlinkns, 'href', `#sheet-${numberOfSheets}`)
			mask.appendChild(use)
		sheetGroupContent.setAttribute('clip-path', `url(#sheet-${numberOfSheets}-mask)`)
		
		sheetList.push($(sheet).attr('id'))
		return $_sheetGroup
	}

	function addLevel ($_sheetGroup) {
		let id = $_sheetGroup.find('.sheet').attr('id')
		let width = 128
		let height = 24

		$('.level').each(function(){
			let $_group = $(this)
			let y = parseFloat($_group.attr('data-y'))
			y += height
			$_group.attr('transform', `translate(0, ${y})`)
			$_group.attr('data-y', y)
			$_group.removeClass('current')
		})

		let $_level = $(document.createElementNS(svgns, 'g'))
			$_level.attr('id', `level-${id}`)
			$_level.attr('class', 'level')
			$_level.attr('data-y', 0)
		let $_rect = $(document.createElementNS(svgns, 'rect'))
			$_rect.attr('x', '0')
			$_rect.attr('y', '0')
			$_rect.attr('width' ,width)
			$_rect.attr('height' ,height)
		let $_text = $(document.createElementNS(svgns, 'text'))
			$_text.attr('id', `level-${id}-text`)
			$_text.attr('x', 48)
			$_text.attr('y', height/2+3)
		let $_linesGroup = $(document.createElementNS(svgns, 'g'))
		let $_linesGroupRect = $(document.createElementNS(svgns, 'rect'))
			$_linesGroupRect.attr('x', width-24)
			$_linesGroupRect.attr('y', 0)
			$_linesGroupRect.attr('width', 24)
			$_linesGroupRect.attr('height', height)
			$_linesGroupRect.attr('fill-opacity', 0)
			$_linesGroupRect.attr('class', 'move-level-area')
		let $_line1 = $(document.createElementNS(svgns, 'line'))
			$_line1.attr('x1', width-5)
			$_line1.attr('y1', height/2-2.5)
			$_line1.attr('x2', width-20)
			$_line1.attr('y2', height/2-2.5)
			$_line1.attr('stroke-width', 2)
			$_line1.attr('stroke', 'white')
		let $_line2 = $(document.createElementNS(svgns, 'line'))
			$_line2.attr('x1', width-5)
			$_line2.attr('y1', height/2+2.5)
			$_line2.attr('x2', width-20)
			$_line2.attr('y2', height/2+2.5)
			$_line2.attr('stroke-width', 2)
			$_line2.attr('stroke', 'white')
		let $_hideButton = $_hideLevelButton.clone()
			$_hideButton.attr('display', '')	
		let $_lockButton = $_lockLevelButton.clone()
			$_lockButton.attr('display', '')

		$_level.append($_rect)
		$_level.append($_text)
		$_linesGroup.append($_line1)
		$_linesGroup.append($_line2)
		$_linesGroup.append($_linesGroupRect)
		$_level.append($_linesGroup)
		$_level.append($_hideButton)
		$_level.append($_lockButton)
		$_level.addClass('current')
		$_levelsGroup.append($_level)

		document.querySelector(`#level-${id}-text`).textContent = id.replace('sheet', 's')
	}

	function removeLevel (sheetGroup) {
		id = sheetGroup.find('.sheet').attr('id')
		let levelToRemove = $(`#level-${id}`)
		let levelToRemoveY = levelToRemove.attr('data-y')
		levelToRemove.remove()
		let index = sheetList.indexOf(id)
		sheetList.splice(index, 1)
		sheetList.forEach(function(element){
			let id = element
			let $_group = $(`#level-${id}`)
			let y = parseFloat($_group.attr('data-y'))
			if ( y > levelToRemoveY) {
				y -= 24
				$_group.attr('data-y',y)
				$_group.attr('transform', `translate(0, ${y})`)
			}
		})

	}

	$(document).on('click', '.level', function(e){
		let target = $(this)
		$('.level').not(target).removeClass('current')
		target.addClass('current')
		let id = target.attr('id').replace('level-','')
		$('.sheet').not($(`#${id}`)).parent().removeClass('current')
		let sheetToCurrent = $(`#${id}`).parent()
		sheetToCurrent.addClass('current')
		showInterface(sheetToCurrent)
	})

	$(document).on('click', '.level .hide-level-button', function(e){
		e.stopImmediatePropagation()
		$(this).toggleClass('current')
		let $_sheetGroup = $(`#${$(this).parent().attr('id').replace('level-', '')}`).parent()
		$_sheetGroup.toggleClass('hidden')
		if ($_sheetGroup.hasClass('current')){
			hideInterface()
			$_sheetGroup.removeClass('current on-straight-draw on-free-draw on-delete-line')
		 }
		updateMusicData()

	})

	$(document).on('click', '.level .lock-level-button', function(e){
		e.stopImmediatePropagation()
		$(this).toggleClass('current')
		let $_sheetGroup = $(`#${$(this).parent().attr('id').replace('level-', '')}`).parent()
		$_sheetGroup.toggleClass('lock')

		if ($_sheetGroup.hasClass('lock')){
			hideInterface()
			$_sheetGroup.removeClass('current on-straight-draw on-free-draw on-delete-line')
		 }
	})

	let $_level
	let maxLevelY 
	let previousLevelY 

	$(document).on('click','.level .move-level-area',function(e){
		e.stopImmediatePropagation()
	})
	$(document).on('mousedown', '.level .move-level-area', function(e){
		let currentLevel = $(this).closest('.level')
		$('.level').not(currentLevel).removeClass('dragging')
		currentLevel.addClass('dragging')
		maxLevelY = (numberOfSheets-1)*24
		$(document).on('mousemove', moveLevel)
		$(document).on('mouseup', endMoveLevel)

	})

	function moveLevel (e) {
		$_level = $('.level.dragging')
		let $_sheetGroup = $(`#${$_level.attr('id').replace('level-', '')}`).parent()
				
		let mouse = findSVGCoords(uniqueEvent(e))

		let y = Math.min(maxLevelY, Math.max(0, mouse.y))
		y = Math.floor(y/24)*24
		$_level.attr('transform', `translate(0, ${y})`)
		$_level.attr('data-y', y)
		
		$('.level').not('.dragging').each(function(){
			let parsedLevelY = parseFloat($(this).attr('data-y'))
			let $_parsedLevelGroup = $(`#${$(this).attr('id').replace('level-', '')}`).parent()
			if ( parsedLevelY == y) { 
				if ( y > previousLevelY) {
					//parsedLevelY = parsedLevelY > 0 ?  parsedLevelY-24 : 0
					parsedLevelY = parsedLevelY-24
					$_parsedLevelGroup.insertAfter($_sheetGroup )
				} else if (y < previousLevelY) {
					//parsedLevelY = parsedLevelY < maxLevelY ?  parsedLevelY+24 : parsedLevelY
					parsedLevelY = parsedLevelY+24
					$_parsedLevelGroup.insertBefore($_sheetGroup)
				}

				$(this).attr('transform', `translate(0, ${parsedLevelY})`)
				$(this).attr('data-y', parsedLevelY)
			}
		})

		previousLevelY = y

	}

	function endMoveLevel (event) {
		$(document).off('mousemove', moveLevel)
		$(document).off('mouseup', endMoveLevel)
	}

	function showInterface (target) {
		let $_target = $(target)
		let sheetWidth = parseFloat($_target.find('rect').attr('width'))
		let sheetHeight = parseFloat($_target.find('rect').attr('height'))
		
		$_target.append($_sheetFrame)
		$_sheetFrame.attr('transform',`translate(-2, -24)`)
		$_sheetFrame.find('#sheet-frame-bar').attr('width', `130`)
		$_sheetFrame.find('#sheet-frame-bar').attr('height', `24`)
		$_sheetFrame.attr('display','')
		$('#sheet-frame-text').text($_target.find('.sheet').attr('id'))

		$_target.append($_sheetTransformButton)
		$_sheetTransformButton.attr('display','')
		$_sheetTransformButton.attr('transform',`translate(${sheetWidth-6}, ${sheetHeight-6})`)

		$_target.append($_soundDrawGroup)
		$_soundDrawGroup.attr('display','')
		$_soundDrawGroup.attr('transform',`translate(${sheetWidth}, -3)`)

		$_soundDrawGroup.find('.current').removeClass('current')

		let sheetInstrument = $('.sheet-group.current').attr('instrument')
		let sheetPartials = $('.sheet-group.current').attr('data-partials')
		let sheetVolume = Math.round(map(parseInt($('.sheet-group.current').attr('data-volume')), -50, 10, 0, 100))

		$('#sheet-settings-menu').find(`#${sheetInstrument}-button`).addClass('current')
		$('#change-partials-cursor').attr('transform', `translate(${map(sheetPartials, 0, 18, 6, 90)},14)`)
		$('#change-volume-cursor').attr('transform', `translate(${map(sheetVolume, 0, 100, 6, 90)},14)`)

		document.querySelector('#partials-value').textContent = sheetPartials
		document.querySelector('#volume-value').textContent = sheetVolume

		$_soundDrawMenu.attr('display','none')	
	}

	function hideInterface () {
		endMoveDeleteCursor()
		$_sheetFrame.appendTo($_editingArea)
		$_sheetTransformButton.appendTo($_editingArea)
		$_soundDrawGroup.appendTo($_editingArea)

		$_sheetFrame.attr('display','none')	
		$_sheetTransformButton.attr('display','none')
		$_soundDrawGroup.attr('display','none')
		$_soundDeleteCursor.toggle(false)
		$_sheetSettingsMenu.attr('display','none')

	}

	let $_sheetGroup,
		sheetOffsetX,
		sheetOffsetY;

	$_newSheetButton.on('click', function (e) {
		$(this).toggleClass('current')
		$('.sheet-group.current').removeClass('current')
		hideInterface()
		if ( !$(this).hasClass('current') ) {
			setMode(defaultMode)
		} else {
			setMode('addSheetGroup')
			$(document).on('mousemove', showGhost)
			$(document).on('mouseup', endShowGhost)
		}
		
	})

	let ghostX
	let ghostY

	function showGhost (e) {
		let mouse = findSVGCoords(uniqueEvent(e))
		if ( mouse.x <= editingAreaWidth && mouse.x >= 0 && mouse.y <= editingAreaHeight && mouse.y >= 0 ) {
			ghostX = Math.min(editingAreaWidth-200, Math.max(0, mouse.x))
			ghostY = Math.min(editingAreaHeight-120, Math.max(0, mouse.y))

			ghostX = anchorX ? Math.round(ghostX/anchorXInterval)*anchorXInterval : ghostX
			ghostY = anchorY ? Math.round(ghostY/anchorYInterval)*anchorYInterval : ghostY

			$_ghostSheet.attr('display', '')
			$_ghostSheet.attr('transform', `translate(${ghostX}, ${ghostY})`)
			$_ghostSheet.attr('data-x', ghostX)
			$_ghostSheet.attr('data-y', ghostY)
		} else {
			$_ghostSheet.attr('display', 'none')
		}
	}

	function endShowGhost () {
		$_ghostSheet.attr('display', 'none')
		$(document).off('mousemove', showGhost)
		$(document).off('mouseup', endShowGhost)
	}


	let mouseAbsPosition
	let cursorXDifference

	$_changeViewCursor.on('mousedown', (e) => {
		let mouse = findSVGCoords(uniqueEvent(e))
		mouseAbsPosition = mouse.x-parseInt($('#view-mode').attr('data-x'))
		cursorXDifference = mouseAbsPosition-$_changeViewCursor.attr('data-x')
		$(document).on('mousemove', changeView)
		$(document).on('mouseup', endChangeView)
	})

	$('#view-mode-cursor-rect').on('mousedown', (e) => {
		let mouse = findSVGCoords(uniqueEvent(e))
		mouseAbsPosition = mouse.x-parseInt($('#view-mode').attr('data-x'))
		cursorXDifference = mouseAbsPosition-$('#view-mode-cursor-rect').attr('data-x')
		$(document).on('mousemove', changeView)
		$(document).on('mouseup', endChangeView)
	})

	let effectiveCursorPosition = 0
	let anchorXInterval = 100
	let anchorYInterval = 17.5

	function changeView (e) {
		let mouse = findSVGCoords(uniqueEvent(e))
		mouseAbsPosition = mouse.x-700
		let $_rect = $('#view-mode-background')
		let maxX = parseFloat($_rect.attr('width'))
		let minX = 0
		let cursorX = Math.min(maxX-maxX/5, Math.max(mouseAbsPosition-cursorXDifference, minX))
		effectiveCursorPosition = (Math.floor(cursorX/20)*20)-2.5
		switch (effectiveCursorPosition) {
			case 17.5:
				$('#background').attr('fill', 'url(#pattern-1)')
				anchorXInterval = 50
				break;
			case 37.5:
				$('#background').attr('fill', 'url(#pattern-2)')
				anchorXInterval = 25
				break;
			case 57.5:
				$('#background').attr('fill', 'url(#pattern-3)')
				anchorXInterval = 12.5
				break;
			case 77.5:
				$('#background').attr('fill', 'url(#pattern-4)')
				anchorXInterval = 6.25
				break;
			default:
				$('#background').attr('fill', 'url(#pattern-0)')
				anchorXInterval = 100
				break;
		}
		$_changeViewCursor.attr('transform',`translate(${effectiveCursorPosition}, -4)`)
		$_changeViewCursor.attr('data-x', cursorX)
		$('#view-mode-cursor-rect').attr('transform',`translate(${effectiveCursorPosition}, 0)`)
		$('#view-mode-cursor-rect').attr('data-x', cursorX+5)
	}

	function endChangeView () {
		$(document).off('mousemove', changeView)
		$(document).off('mouseup', endChangeView)
	}

	function updateBpm (val) {
		bpm  = val
		beatDuration = 60 / bpm
	}

	let wasPlaying = false
	$_changeBpmCursor.on('mousedown', (e) => {
		$(document).on('mousemove', changeBpm)
		$(document).on('mouseup', endChangeBpm)
		wasPlaying = play
	})

	function changeBpm (e) {
		let mouse = findSVGCoords(uniqueEvent(e))
		mouseAbsPosition = mouse.x - 404
		let maxX = 82
		let minX = 0
		let cursorX = Math.round(Math.min(maxX, Math.max(mouseAbsPosition, minX)))
		let changeBpm = Math.round(map(cursorX, 0, 82, 70, 185))
		
		console.log('changing',$_playBar.attr('data-x'),xToTime($_playBar.attr('data-x')))
		
		if(play) $_playPauseButton.trigger('click')

		updateBpm(changeBpm)
		
		document.querySelector(`#bpm-value`).textContent = changeBpm

		$_changeBpmCursor.attr('transform',`translate(${cursorX}, 0)`)
		$_changeBpmCursor.attr('data-x', cursorX)

	}

	function endChangeBpm () {
		let barTime = xToTime($_playBar.attr('data-x'))
		$_playBar.attr('data-time', barTime)
		pauseTime = barTime
		if(wasPlaying && !play) $_playPauseButton.trigger('click')

		$(document).off('mousemove', changeBpm)
		$(document).off('mouseup', endChangeBpm)
	}


	let changeOctaveX = parseInt($('#change-octave').attr('data-x'))
	let octaveCursorContentPrevX
	let octaveCursorContentMouseDelta
	let mouseStartX
	$_octaveCursorContent.on('mousedown', function(e) {
		let mouse = findSVGCoords(uniqueEvent(e))
		octaveCursorContentPrevX = parseInt($_octaveCursorContent.attr('data-x'))
		octaveCursorContentMouseDelta = mouse.x - changeOctaveX
		mouseStartX = mouse.x
		$(document).on('mousemove', changeOctave)
		$(document).on('mouseup', endChangeOctave)
	})

	let cursorX

	function changeOctave (e) {
		let mouse = findSVGCoords(uniqueEvent(e))
		mouseAbsPosition = mouse.x-changeOctaveX
		let mouseDelta = mouse.x - mouseStartX + octaveCursorContentPrevX

		let maxX = 6
		let minX = -114
		cursorX = Math.round(Math.min(maxX, Math.max(mouseDelta, minX)))
		
		cursorX = Math.round(cursorX/24)*24 + 6
		
		$_octaveCursorContent.attr('transform',`translate(${cursorX}, 0)`)
		$_octaveCursorContent.attr('data-x', cursorX)
	}

	function endChangeOctave () {
		switch (cursorX) {
			case 6:
				//C1 -> B0
				minFrequency = 30.87
				break;
			case -18:
				//C2 -> B1
				minFrequency = 61.74
				break;
			case -42:
				//C3 -> B2
				minFrequency = 123.47
				break;
			case -66:
				//C4 -> B3
				minFrequency = 246.94
				break;
			case -90:
				//C5 -> B4
				minFrequency = 493.88
				break;
			case -114:
				//C6 -> B5
				minFrequency = 987.77
				break;
		}

		$(document).off('mousemove', changeOctave)
		$(document).off('mouseup', endChangeOctave)
	}

	$_clearAllButton.on('click', function () {
		hideInterface()
		$('.sheet-group').remove()
		$('.level').remove()
		sheetList = []
		numberOfSheets = 0
	})

	$_editingArea.on('click', function(e) {
		switch(mode){
			case 'addSheetGroup':
				endShowGhost()
				let newSheet = createSheet(ghostX,ghostY)
				showInterface(newSheet)
				setMode(defaultMode)
				addLevel(newSheet)
				$_newSheetButton.removeClass('current')
			break;
		}
	})

	$(document).on('mousedown', '.sheet-group', function(event) {
		if($(this).hasClass('current')) return;
		if(mode == 'addSheetGroup') return;
		$('.sheet-group').removeClass('current on-free-draw on-straight-draw on-delete-line')
		$_soundDeleteCursor.toggle(false)
		$(this).addClass('current')
		showInterface($(this))
		setMode(defaultMode)

		let id = $(this).find('.sheet').attr('id')
		let $_level = $(`#level-${id}`)

		$('.level').not($_level).removeClass('current')
		$_level.addClass('current')

	})


	function setMode(newMode){
		$(svgRoot)
			.attr('class','')
			.addClass(newMode)
		mode = newMode
	}

	let anchorX = true
	let anchorY = true
	let currentChoiceX
	let anchorSettingsMenuX = 600

	$_anchorSettingsButton.on('click', function (e) {
		$(this).toggleClass('current')
		$_anchorSettingsMenu.toggle()
	})

	$('.switch.anchor-toggler').on('mousedown', function(e){
		let $_currentChoice = $(this)
		currentChoiceId = $_currentChoice.attr('id')
		currentChoiceX = $_currentChoice.attr('data-x')

		let mouse = findSVGCoords(uniqueEvent(e))
		cursorXDifference = mouseAbsPosition-$(`#${currentChoiceId}`).find('circle').attr('data-x')
		$(document).on('mousemove', toggleAnchor)
		$(document).on('mouseup', endToggleAnchor)
	})

	function toggleAnchor (e) {
		let mouse = findSVGCoords(uniqueEvent(e))
		let $_circle = $(`#${currentChoiceId} circle`)
		let $_path = $(`#${currentChoiceId} path`)
		mouseAbsPosition = mouse.x-currentChoiceX-anchorSettingsMenuX
		let maxX = 10
		let minX = 0
		let cursorX = Math.min(maxX, Math.max(mouseAbsPosition, minX))

		effectiveCursorPosition = (Math.round(cursorX/10)*10)
		$_circle.attr('transform', `translate(${effectiveCursorPosition}, 0)`)

		if (effectiveCursorPosition ) {
			$_circle.attr('fill', '#1D1D1D')
			$_path.attr('fill', 'white')
		} else {
			$_circle.attr('fill', 'white')
			$_path.attr('fill', '#1D1D1D')
		}
	}

	function endToggleAnchor (e) {

		switch (currentChoiceId) {
			case 'anchor-sheet-x-switch':
				anchorX = effectiveCursorPosition
				break;
			case 'anchor-sheet-y-switch':
				anchorY = effectiveCursorPosition
				break;
			case 'anchor-drawing-x-switch':
				anchorDrawX =  effectiveCursorPosition
				break;
			case 'anchor-drawing-y-switch':
				anchorDrawY = effectiveCursorPosition
				break;

		}

		$(document).off('mousemove', toggleAnchor)
		$(document).off('mouseup', endToggleAnchor)
	}

	let currentScale = 'chromatic'
	let scaleStartTone = 'C'
	let visibleTones = semitoneList

	$_scaleSettingsButton.on('click', function(e) {
		$(this).toggleClass('current')
		$_scaleSettingsMenu.toggle('fast')

	})

	$('#chosen-scale').on('click', function(e){
		$_scaleChoiceMenu.toggle('fast')
	})

	$('.scale-option').on('click', function(e) {
		target = $(this)
		$('.scale-option').not(target).removeClass('current')
		target.addClass('current')
		id = target.attr('id')
		setScale(id)
	})

	function setScale(scale) {
		let intervals = scaleList[scale]
		currentScale = scale
		let visibleToneText = scaleStartTone.includes('plus') ? scaleStartTone.replace('plus', '+') : scaleStartTone
		document.querySelector(`#chosen-scale-text`).textContent = `${visibleToneText} - ${scale}`
		let startIndex = semitoneList.indexOf(scaleStartTone)
		let indexes  = [startIndex]

		intervals.forEach(function(interval){

			startIndex += interval
			startIndex = startIndex <= semitoneList.length-1 ? startIndex : startIndex-semitoneList.length
			indexes.push(startIndex)
		})
		visibleTones = []
		indexes.forEach( function (index){
			visibleTones.push(semitoneList[index])
		})
		//nota di partenza
		$('.scale-key').removeClass('current')
		$('.scale-led').removeClass('current')
		$('.horizontal-line').removeClass('current main-line')
		$(`.horizontal-line[data-id="${scaleStartTone}"]`).addClass('main-line')
		$(`#${scaleStartTone}-key`).addClass('current')

		visibleTones.forEach( function (tone) {
			//led
			$(`#${tone}-led`).addClass('current')
			//linee
			$(`.horizontal-line[data-id="${tone}"]`).addClass('current')
		})

	}

	$('.scale-key').on('click', function (e) {
		scaleStartTone = $(this).attr('id').replace('-key', '')
		setScale(currentScale)
	})

	$_sheetTransformButton.on('mousedown', (event) => {
		event.stopImmediatePropagation()
		let $_sheetGroup = $_sheetTransformButton.parent()
		sheetOffsetX = parseFloat($_sheetGroup.attr('data-x'))
		sheetOffsetY = parseFloat($_sheetGroup.attr('data-y'))
		$(document).on('mousemove', transformSheet)
		$(document).on('mouseup', endTransformSheet)
	})

	function transformSheet (event) {
		let mouse = findSVGCoords(uniqueEvent(event))
		let $_sheetGroup = $_sheetTransformButton.parent()
		
		let buttonX = Math.min(editingAreaWidth-sheetOffsetX, Math.max(155, mouse.x-sheetOffsetX))
		let buttonY = Math.min(editingAreaHeight-sheetOffsetY, Math.max(55,mouse.y-sheetOffsetY))

		buttonX = anchorX ? Math.round((sheetOffsetX+buttonX)/anchorXInterval)*anchorXInterval-sheetOffsetX : buttonX
		buttonY = anchorY ? Math.round((sheetOffsetY+buttonY)/anchorYInterval)*anchorYInterval-sheetOffsetY : buttonY

		$_sheetTransformButton.attr('transform',`translate(${buttonX-5}, ${buttonY-5})`)
		$_soundDrawGroup.attr('transform', `translate(${buttonX}, 0)`)
		let $_rect = $_sheetGroup.find('.sheet')
		$_rect.attr('width', buttonX)
		$_rect.attr('height', buttonY)

		$_editingArea.attr('cursor', 'se-resize')
		$_sheetGroup.attr('cursor', 'nw-resize')
	}

	function endTransformSheet () {
		$(document).off('mousemove', transformSheet)
		$(document).off('mouseup', endTransformSheet)

		$_sheetTransformButton.parent().attr('cursor', 'default')
		$_editingArea.attr('cursor', 'default')
	}


	$(document).on('mousedown', '.current #sheet-frame', function(event) {
		event.stopImmediatePropagation()
		$_sheetGroup = $('.sheet-group.current')
		$('.sheet-group.current').removeClass('on-free-draw on-straight-draw on-delete-line')
		$_soundDrawMenu.css('display','none')
		$_soundFreeDrawButton.removeClass('current')
		$_soundStraightDrawButton.removeClass('current')
		$_soundDeleteLineButton.removeClass('current')
		$_soundDeleteCursor.toggle(false)
		mode = defaultMode
		let mouse = findSVGCoords(uniqueEvent(event))
		sheetOffsetX = mouse.x-parseFloat($_sheetGroup.attr('data-x'))
		sheetOffsetY = mouse.y-parseFloat($_sheetGroup.attr('data-y'))
		$(document).on('mousemove', moveSheet)
		$(document).on('mouseup', endMoveSheet)
		$_editingArea.attr('cursor', 'grabbing')

	})

	function moveSheet (event) {
		event.stopImmediatePropagation()
		let mouse = findSVGCoords(uniqueEvent(event))
		let sheetWidth = parseFloat($_sheetGroup.find('rect').attr('width'))
		let sheetHeight = parseFloat($_sheetGroup.find('rect').attr('height'))
		let sheetX = Math.min(editingAreaWidth-sheetWidth, Math.max(0, mouse.x-sheetOffsetX))
		let sheetY = Math.min(editingAreaHeight-sheetHeight, Math.max(0, mouse.y-sheetOffsetY))

		sheetX = anchorX ? Math.round(sheetX/anchorXInterval)*anchorXInterval : sheetX
		sheetY = anchorY ? Math.round(sheetY/anchorYInterval)*anchorYInterval : sheetY


		$_sheetGroup.attr('transform',`translate(${sheetX}, ${sheetY})`)
		$_sheetGroup.attr('data-x', sheetX)
		$_sheetGroup.attr('data-y', sheetY)
	}

	function endMoveSheet () {
		$(document).off('mousemove', moveSheet)
		$(document).off('mouseup', endMoveSheet)
		$_editingArea.attr('cursor', 'auto')
	}

	$(document).on('click', '#sheet-delete-button', function(event){
		hideInterface()
		removeLevel($('.sheet-group.current'))
		$('.sheet-group.current').remove()
		})

	let mode = 'moveSheetGroups'
	let defaultMode = mode
	setMode(defaultMode)

	$('#sheet-instrument-settings').on('click', function (e) {
		let id = $(e.target).parent().attr('id')
		let $_sheetGroup = $('.sheet-group.current')
		$('.sheet-group.current .button').not($(e.target).closest('.button')).removeClass('current')

		switch (id) {
			case 'sawtooth-button':
				$_sheetGroup.attr('instrument','sawtooth')
				$(e.target).closest('.button').addClass('current')
				break;
			case 'square-button':
				$_sheetGroup.attr('instrument','square')
				$(e.target).closest('.button').addClass('current')
				break;
			case 'triangle-button':
				$_sheetGroup.attr('instrument','triangle')
				$(e.target).closest('.button').addClass('current')
				break;
			default:
				$_sheetGroup.attr('instrument','sine')
				$(e.target).closest('.button').addClass('current')
				break;
		}
	})

	function verifyInstrument (sheetGroup) {
		let instrument = sheetGroup.attr('instrument')

		switch (instrument){
			case 'square':
				return 'square'
				break;	
			case 'triangle':
				return 'triangle'
				break;
			case 'sawtooth':
				return 'sawtooth'
				break;
			default:
				return 'sine'
				break;

		}
	}

	$_sheetSettingsButton.on('click', function (e) {
		$_sheetSettingsMenu.toggle('fast')
		$('.sheet-group.current').removeClass('on-delete-line on-free-draw on-straight-draw')
		$_soundFreeDrawButton.removeClass('current')
		$_soundDeleteLineButton.removeClass('current')
		$_soundStraightDrawButton.removeClass('current')
		$_soundDeleteCursor.toggle(false)

	})

	$_changePartialsCursor.on('mousedown', function (e) {
		$(document).on('mousemove', changePartials)
		$(document).on('mouseup', endChangePartials)
	})

	let changePartialsCount

	function changePartials (e) {
		let mouse = findSVGCoords(uniqueEvent(e))
		mouseAbsPosition = mouse.x - parseFloat($('.sheet-group.current').attr('data-x')) - parseFloat($('.sheet-group.current .sheet').attr('width')) + 11
		let maxX = 90
		let minX = 6
		let cursorX = Math.round(Math.min(maxX, Math.max(mouseAbsPosition, minX)))
		changePartialsCount = Math.round(map(cursorX, 6, 90, 0, 18))

		document.querySelector('#partials-value').textContent = changePartialsCount

		$_changePartialsCursor.attr('transform',`translate(${cursorX}, 14)`)
		$_changePartialsCursor.attr('data-x', cursorX)
	}

	function endChangePartials () {
		$('.sheet-group.current').attr('data-partials', changePartialsCount)
		$(document).off('mousemove', changePartials)
		$(document).off('mouseup', endChangePartials)
	}

	$_changeVolumeCursor.on('mousedown', function (e) {
		$(document).on('mousemove', changeVolume)
		$(document).on('mouseup', endChangeVolume)
	})

	let changeVolumeVal
	let newVolume

	function changeVolume(e) {
		let mouse = findSVGCoords(uniqueEvent(e))
		mouseAbsPosition = mouse.x - parseFloat($('.sheet-group.current').attr('data-x')) - parseFloat($('.sheet-group.current .sheet').attr('width')) + 11
		let maxX = 90
		let minX = 6
		let cursorX = Math.round(Math.min(maxX, Math.max(mouseAbsPosition, minX)))
		newVolume = Math.round(map(cursorX, 6, 90, -50, 10))
		let changeVolumeVal = Math.round(map(newVolume, -50, 10, 0, 100))
		
		document.querySelector('#volume-value').textContent = changeVolumeVal

		$_changeVolumeCursor.attr('transform',`translate(${cursorX}, 14)`)
		$_changeVolumeCursor.attr('data-x', cursorX)
	}

	function endChangeVolume () {
		$('.sheet-group.current').attr('data-volume', newVolume)
		$(document).off('mousemove', changeVolume)
		$(document).off('mouseup', endChangeVolume)
	}

	let $_sheetGroupDuplicate
	let duplicateWidth
	let duplicateHeight
	let duplicateX
	let duplicateY


	$_sheetDuplicateButton.on('click', function (e) {
		$_sheetGroup = $(this).closest('.sheet-group')
		let id = $_sheetGroup.find('.sheet').attr('id')
		hideInterface()
		$_sheetGroupDuplicate = $_sheetGroup.clone()
		let $_duplicateMask = $(`#${id}-mask`).clone()
		numberOfSheets ++

		$('.sheet-group.current').removeClass('current')
		e.stopImmediatePropagation()
		setMode('duplicateSheetGroup')

		duplicateWidth = parseFloat($_sheetGroupDuplicate.find('.sheet').attr('width'))
		duplicateHeight = parseFloat($_sheetGroupDuplicate.find('.sheet').attr('height'))
		duplicateX = $_sheetGroupDuplicate.attr('data-x')
		duplicateY = $_sheetGroupDuplicate.attr('data-y')

		$_sheetGroupDuplicate.find('.sheet').attr('id', `sheet-${numberOfSheets}`)
		$_sheetGroupDuplicate.find('.sheet-group-content').attr('id', `sheet-${numberOfSheets}-content`)
		$_sheetGroupDuplicate.addClass('ghost')
		$_duplicateMask.attr('id', `sheet-${numberOfSheets}-mask`)
		$_duplicateMask.find('use').attr('href', `#sheet-${numberOfSheets}`)
		$_defs.append($_duplicateMask)
		$_sheetGroupDuplicate.find('.sheet-group-content').attr('clip-path', `url(#sheet-${numberOfSheets}-mask)`)
		$_editingArea.append($_sheetGroupDuplicate)

		$(document).on('mousemove', showDuplicateSheet)
		$(document).on('click', endShowDuplicateSheet)
		
	})


	function showDuplicateSheet (e) {
		let mouse = findSVGCoords(uniqueEvent(e))
		if ( mouse.x <= editingAreaWidth && mouse.x >= 0 && mouse.y <= editingAreaHeight && mouse.y >= 0 ) {
			duplicateX = Math.min(editingAreaWidth-duplicateWidth, Math.max(0, mouse.x))
			duplicateY = Math.min(editingAreaHeight-duplicateHeight, Math.max(0, mouse.y))

			duplicateX = anchorX ? Math.round(duplicateX/anchorXInterval)*anchorXInterval : duplicateX
			duplicateY = anchorY ? Math.round(duplicateY/anchorYInterval)*anchorYInterval : duplicateY

			$_sheetGroupDuplicate.attr('display', '')			
			$_sheetGroupDuplicate.attr('transform', `translate(${duplicateX}, ${duplicateY})`)
			$_sheetGroupDuplicate.attr('data-x', duplicateX)
			$_sheetGroupDuplicate.attr('data-y', duplicateY)
		} else {
			$_sheetGroupDuplicate.attr('display', 'none')
		}
	}

	function endShowDuplicateSheet (e) {
		e.stopImmediatePropagation()
		e.stopPropagation()
		$_sheetGroupDuplicate.removeClass('ghost')
		$('.sheet-group.current').removeClass('current')
		$_sheetGroupDuplicate.addClass('current')
		showInterface($_sheetGroupDuplicate)
		addLevel($_sheetGroupDuplicate)
		setMode(defaultMode)
		sheetList.push($_sheetGroupDuplicate.find('.sheet').attr('id'))
		$(document).off('mousemove', showDuplicateSheet)
		$(document).off('click', endShowDuplicateSheet)
	}

	$_soundFreeDrawButton.on('click', function(event) {
		let $_target = $('.sheet-group.current')
		$(this).toggleClass('current')
		//$_soundDrawMenu.toggle($(this).hasClass('current'))

		setMode($(this).hasClass('current') ? 'freeDraw' : defaultMode)
		$_target.toggleClass('on-free-draw')
			
		$_target.removeClass('on-straight-draw on-delete-line')
		$_soundStraightDrawButton.removeClass('current')
		$_soundDeleteLineButton.removeClass('current')
		$_soundDeleteCursor.toggle(false)
	})

	
	let anchorDrawX = false
	let anchorDrawY = false

	let $_line
	let $_path
	let currentDrawnLine
	let sheetWidth 
	let sheetHeight
	let previousLineX
	let previousLineY 

	let freeDrawAnchorX
	let freeDrawAnchorY

	$(document).on('mousedown', '.sheet-group.on-free-draw.current .sheet', function(event) {
		let mouse = findSVGCoords(uniqueEvent(event))
		previousLineX = 0

		$_sheetGroup = $(this).parent()
		sheetOffsetX = $_sheetGroup.attr('data-x')
		sheetOffsetY = $_sheetGroup.attr('data-y')
		
		sheetWidth = parseFloat($_sheetGroup.find('rect').attr('width'))
		sheetHeight = parseFloat($_sheetGroup.find('rect').attr('height'))

		$_path = $(document.createElementNS(svgns, 'g'))

		let x = mouse.x-sheetOffsetX
		let y = mouse.y-sheetOffsetY

		x = anchorDrawX ? Math.round(x/anchorXInterval)*anchorXInterval : x
		y = anchorDrawY ? Math.round(y/anchorYInterval)*anchorYInterval : y

		$_path.attr('data-begin-x', x.toFixed(1))
		$('.on-free-draw .sheet-group-content').append($_path)

		previousLineX = x
		previousLineY = y

		$(document).on('mousemove', freeDrawSound)
		$(document).on('mouseup', endFreeDrawSound) 
	})

	function freeDrawSound (event) {
		let mouse = findSVGCoords(uniqueEvent(event))
		let newPointX = Math.max(previousLineX, Math.min(mouse.x-sheetOffsetX, sheetWidth))
		let newPointY = Math.max(0, Math.min(mouse.y-sheetOffsetY, sheetHeight))

		newPointX = anchorDrawX ? Math.round(newPointX/anchorXInterval)*anchorXInterval : newPointX
		newPointY = anchorDrawY ? Math.round(newPointY/anchorYInterval)*anchorYInterval : newPointY

		$_line = $(document.createElementNS(svgns, 'line'))
		$_line.attr('x1', previousLineX.toFixed(1))
		$_line.attr('y1', previousLineY.toFixed(1))
		$_line.attr('x2', newPointX.toFixed(1))
		$_line.attr('y2', newPointY.toFixed(1))
		$_line.attr('stroke', `black`)
		$_line.attr('stroke-width', `1`)
		$_line.attr('stroke-linecap', `round`)
		$_path.append($_line)

		previousLineX = newPointX
		previousLineY = newPointY
		
	}

	function endFreeDrawSound () {
		$_path.attr('data-end-x', previousLineX.toFixed(1))
		$(document).off('mousemove', freeDrawSound)
		$(document).off('mouseup', endFreeDrawSound)
	}

	$_soundStraightDrawButton.on('click', function() {
		let $_target = $('.sheet-group.current')
		$(this).toggleClass('current')
		//$_soundDrawMenu.toggle($(this).hasClass('current'))

		setMode($(this).hasClass('current') ? 'straightDraw' : defaultMode)
		$_target.toggleClass('on-straight-draw')
		$_target.removeClass('on-free-draw on-delete-line')
		$_soundFreeDrawButton.removeClass('current')
		$_soundDeleteLineButton.removeClass('current')
		$_soundDeleteCursor.toggle(false)
	})

	let $_ghostLine
	let ghostLineX
	let ghostLineY

	$(document).on('mousedown', '.sheet-group.current.on-straight-draw .sheet',function(event) {
		let mouse = findSVGCoords(uniqueEvent(event))
		
		$_sheetGroup = $(this).parent()
		sheetOffsetX = parseFloat($_sheetGroup.attr('data-x'))
		sheetOffsetY = parseFloat($_sheetGroup.attr('data-y'))
		
		sheetWidth = parseFloat($_sheetGroup.find('rect').attr('width'))
		sheetHeight = parseFloat($_sheetGroup.find('rect').attr('height'))

		$_path = $(document.createElementNS(svgns, 'g'))

		let x = parseFloat(mouse.x-sheetOffsetX)
		let y = parseFloat(mouse.y-sheetOffsetY)

		x = anchorDrawX ? Math.round(x/anchorXInterval)*anchorXInterval : x
		y = anchorDrawY ? Math.round(y/anchorYInterval)*anchorYInterval : y

		$_ghostLine = $(document.createElementNS(svgns, 'line'))
		$_ghostLine.attr('stroke', 'black')
		$_ghostLine.attr('class', 'ghost-line')
		$_ghostLine.attr('stroke-opacity', 0.5)
		$_ghostLine.attr('stroke-width', 1)
		$_ghostLine.attr('stroke-linecap', 'round')
		$_ghostLine.attr('x1', x)
		$_ghostLine.attr('y1', y)
		$_ghostLine.attr('x2', x)
		$_ghostLine.attr('y2', y)
		$_sheetGroup.append($_ghostLine)

		$_path.attr('data-begin-x', x.toFixed(1))

		previousLineX = x
		previousLineY = y
		$(document).on('mousemove', straightDrawSound)
		$(document).on('mouseup', endStraightDrawSound)

	})

	let straightDrawX
	let straightDrawY
  
	function straightDrawSound (event) {
		let mouse = findSVGCoords(uniqueEvent(event))
		
		x = Math.max(previousLineX, Math.min(mouse.x-sheetOffsetX, sheetWidth))
		y = Math.max(0, Math.min(mouse.y-sheetOffsetY, sheetHeight))

		x = anchorDrawX ? Math.round(x/anchorXInterval)*anchorXInterval : x
		y = anchorDrawY ? Math.round(y/anchorYInterval)*anchorYInterval : y

		straightDrawX = x
		straightDrawY = y
		
		$_ghostLine.attr('x2', straightDrawX)
		$_ghostLine.attr('y2', straightDrawY)
	}


	function endStraightDrawSound (event) {
		let lineLength = $('.ghost-line')[0].getTotalLength()
		$('.ghost-line').remove()


		if(previousLineX!=straightDrawX){	
			let numberOfSegments = Math.round(lineLength/straightSegmentLength)
			let segmentsDeltaX = (straightDrawX-previousLineX)/numberOfSegments
			let segmentsDeltaY = (straightDrawY-previousLineY)/numberOfSegments
			for (let i = 0; i < numberOfSegments; i++) {
				$_line = $(document.createElementNS(svgns, 'line'))
				$_line.attr('stroke', 'black')
				$_line.attr('stroke-width', 1)
				$_line.attr('stroke-linecap', 'round')
				$_line.attr('x1', previousLineX + segmentsDeltaX*i)
				$_line.attr('y1', previousLineY + segmentsDeltaY*i)
				$_line.attr('x2', previousLineX + segmentsDeltaX*(i+1))
				$_line.attr('y2', previousLineY + segmentsDeltaY*(i+1))
				$_path.append($_line)
			}
			
			$_path.attr('data-end-x', straightDrawX.toFixed(1))
			$_sheetGroup.find('.sheet-group-content').append($_path)

		}
		
		$(document).off('mousemove', straightDrawSound)
		$(document).off('mouseup', endStraightDrawSound)
	}

	let sheetOffsetMoveX
	let sheetOffsetMoveY

	$_soundDeleteLineButton.on('click', function(e) {
		let mouse = findSVGCoords(uniqueEvent(event))
		let $_target = $('.sheet-group.current')
		$(this).toggleClass('current')
		$_soundDrawMenu.toggle(false)
		$_soundDeleteCursor.toggle($(this).hasClass('current'))

		setMode($(this).hasClass('current') ? 'deleteLine' : defaultMode)
		$_target.toggleClass('on-delete-line')
		$_target.removeClass('on-free-draw on-straight-draw')

		sheetOffsetMoveX = $_target.attr('data-x')
		sheetOffsetMoveY = $_target.attr('data-y')
		
		sheetWidth = parseFloat($_target.find('rect').attr('width'))
		sheetHeight = parseFloat($_target.find('rect').attr('height'))

		let x = Math.max(0, Math.min(mouse.x-sheetOffsetMoveX, sheetWidth))
		let y = Math.max(0, Math.min(mouse.y-sheetOffsetMoveY, sheetHeight))
		$_soundDeleteCursor.attr('cx', x)
		$_soundDeleteCursor.attr('cy', y)
		$_target.append($_soundDeleteCursor)

		$_soundFreeDrawButton.removeClass('current')
		$_soundStraightDrawButton.removeClass('current')

		$(document).on('mousemove', moveDeleteCursor)

	})

	function moveDeleteCursor (event) {
		let mouse = findSVGCoords(uniqueEvent(event))
		let $_target = $('.sheet-group.current')

		sheetOffsetMoveX = $_target.attr('data-x')
		sheetOffsetMoveY = $_target.attr('data-y')
		
		sheetWidth = parseFloat($_target.find('rect').attr('width'))
		sheetHeight = parseFloat($_target.find('rect').attr('height'))

		let x = Math.max(0, Math.min(mouse.x-sheetOffsetMoveX, sheetWidth))
		let y = Math.max(0, Math.min(mouse.y-sheetOffsetMoveY, sheetHeight))
		$_soundDeleteCursor.attr('cx', x)
		$_soundDeleteCursor.attr('cy', y)
	}

	function endMoveDeleteCursor (e) {
		$(document).off('mousemove', moveDeleteCursor)
	}

	let $_sheetGroupLines

	$(document).on('mousedown', '.sheet-group.on-delete-line.current', function(event) {
		let mouse = findSVGCoords(uniqueEvent(event))
		previousLineX = 0

		$_sheetGroup = $(this)
		$_sheetGroupLines = $_sheetGroup.find('.sheet-group-content line')
		sheetOffsetX = $_sheetGroup.attr('data-x')
		sheetOffsetY = $_sheetGroup.attr('data-y')
		
		sheetWidth = parseFloat($_sheetGroup.find('rect').attr('width'))
		sheetHeight = parseFloat($_sheetGroup.find('rect').attr('height'))

		let x = mouse.x-sheetOffsetX
		let y = mouse.y-sheetOffsetY

		$_sheetGroupLines.each(function(){
			let $_line = $(this)
			let distance1 = Math.pow($_line.attr('x1')-x,2) + Math.pow($_line.attr('y1')-y,2)
			let distance2 = Math.pow($_line.attr('x2')-x,2) + Math.pow($_line.attr('y2')-y,2)

			if(distance1<deleteRadiusPow2 || distance2<deleteRadiusPow2){
				$_line.remove()
			}
		})

		$(document).on('mousemove', deleteLine)
		$(document).on('mouseup', endDeleteLine) 
	})

	let deleteRadius = parseFloat($_soundDeleteCursor.attr('r'))
	let deleteRadiusPow2 = Math.pow(deleteRadius,2)

	function deleteLine (event) {
		let mouse = findSVGCoords(uniqueEvent(event))
		let deleteRadius = parseFloat($_soundDeleteCursor.attr('r'))

		let $_line = $(document.elementFromPoint(event.pageX, event.pageY))
		if($_line.parents('.sheet-group-content').length) $_line.remove()

		let x = mouse.x-sheetOffsetX
		let y = mouse.y-sheetOffsetY

		$_sheetGroupLines.each(function(){
			let $_line = $(this)
			let distance1 = Math.pow($_line.attr('x1')-x,2) + Math.pow($_line.attr('y1')-y,2)
			let distance2 = Math.pow($_line.attr('x2')-x,2) + Math.pow($_line.attr('y2')-y,2)

			if(distance1<deleteRadiusPow2 || distance2<deleteRadiusPow2){
				$_line.remove()
			}
		})
	}

	function endDeleteLine (event) {
		let $_sheetGroupPaths = $_sheetGroup.find('.sheet-group-content g')
		$_sheetGroupPaths.each(function(){
			if(!$(this).children().length) {
				$(this).remove()
			} else {
				updatePathsData($(this))
			}
		})
		$_sheetGroupPaths = $_sheetGroup.find('.sheet-group-content g')
		$_sheetGroupPaths.each(function(){
			let beginX = editingAreaWidth
			let endX = 0
			$(this).find('line').each(function(){
				let x1 = parseFloat($(this).attr('x1'))
				let x2 = parseFloat($(this).attr('x2'))
				if(x1<beginX) beginX = x1
				if(x2>endX) endX = x2
			})
			$(this).attr('data-begin-x',beginX)
			$(this).attr('data-end-x',endX)
		})

		updateMusicData()

		$(document).off('mousemove', deleteLine)
		$(document).off('mouseup', endDeleteLine)
	}

	let previousEndLineX = false
	let previousEndLineY = false
	let $_targetPath

	function updatePathsData ($_path) {
		let $_linesList = $_path.find('line')
		$_targetPath = $_path
		$_linesList.each( function () {
			$_line = $(this)
			if (previousEndLineX && previousEndLineY) {
				let x = $_line.attr('x1')
				let y = $_line.attr('y1')
				if ( x != previousEndLineX || y != previousEndLineY ) {
					//$_targetPath.remove($_line)
					$_targetPath = $(document.createElementNS(svgns, 'g'))
					$_targetPath.append($_line)
					$('.sheet-group.current .sheet-group-content').append($_targetPath)
				} else {
					if ($_line.parent() != $_targetPath) {
						//$_line.parent().remove($_line)
						$_targetPath.append($_line)
					}
				}
			}
			previousEndLineX = $_line.attr('x2')
			previousEndLineY = $_line.attr('y2')
		})
		previousEndLineX = false
		previousEndLineY = false
	}


	UnmuteButton({
		container : document.querySelector('#unmute-button-holder'),
		title : 'Web Audio',

		//mute : true,
	}).on('start', startContext).on('mute', pauseMusic).on('unmute', playMusic)

	let startTime
	let pauseTime = 0

	let pathsData = []

	let $_playPauseButton = false
	let initialDelay = 0
	function startContext(){
		initialDelay = Tone.now()
		Tone.context.resume()
	}

	function playMusic() {
		startTime = Tone.now() - pauseTime

		Tone.Transport.cancel()
		Tone.Transport.start()
		
		updateMusicData()
		play = true;
		updateTime()
		$_playPauseButton = $(this._button.element)
	}

	function clearAllInstruments(){
		if(pathsData.length>0){
			pathsData.forEach(function(pathData){
				//pathData.sound.unsync().disconnect()
				pathData.sound.dispose()
			})
		}
	}

	updateMusicData = function () {
		clearAllInstruments()
		pathsData = []
		$('.sheet-group').not('.sheet-group.hidden').each(function(){
			let sheetX = parseFloat($(this).attr('data-x'))
			let sheetY = parseFloat($(this).attr('data-y'))
			let sheetWidth = parseFloat($(this).find('.sheet').attr('width'))
			let sheetHeight = parseFloat($(this).find('.sheet').attr('height'))
			let $_linesGroups = $(this).find('.sheet-group-content g')
			let instrument = $(this).attr('instrument')+ $(this).attr('data-partials')
			let vol = $(this).attr('data-volume')
	
			$_linesGroups.each(function() {
				let pathData = {
					item : $(this),
					begin: parseFloat($(this).attr('data-begin-x')) + sheetX,
					end: parseFloat($(this).attr('data-end-x')) + sheetX,
					linesData: [],
					volume : vol,
					sound: new Tone.Oscillator({
						frequency : 440,
						type : instrument
					})
				}

				let $_lines = $(this).find('line')

				let pathBeginTime = xToTime(parseFloat($(this).attr('data-begin-x')))
				$_lines.each(function(){
					let $_line = $(this)
					let x1 = parseFloat($_line.attr('x1'))
					let x2 = parseFloat($_line.attr('x2'))
					let y1 = parseFloat($_line.attr('y1'))
					let y2 = parseFloat($_line.attr('y2'))

					let lineData = [x1+sheetX,x2+sheetX,y1+sheetY,y2+sheetY]

					if (!(lineData[0] >= sheetX && lineData[0] <= sheetX + sheetWidth && lineData[2] >= sheetY && lineData[2] <= sheetY + sheetHeight)
					&&  !(lineData[1] >= sheetX && lineData[1] <= sheetX + sheetWidth && lineData[3] >= sheetY && lineData[3] <= sheetY + sheetHeight)) {
						lineData.mute = true
					}
					pathData.linesData.push(lineData)
				})
				if(pathData.linesData.length>0){
					pathsData.push(pathData)
				}
			})
		})
	}

	function pauseMusic () {
		pauseTime = $_playBar.attr('data-time')
		Tone.Transport.pause()
		play = false
	}

	function timeToX (time){
		return time*(beatWidth/beatDuration)//*numberOfBeatsPerPhrase
	}

	function xToTime (x){
		return x/(beatWidth/beatDuration)
	}

	updateTime = function(){
		if (play) {
			requestAnimationFrame(updateTime)
				//Tone.now returns the current AudioContext time
			let time = Tone.now()-startTime

			if ( time > xToTime(editingAreaWidth)) {
				updateMusicData()
				time = 0
				startTime = Tone.now()
				
				if(!loop){
					$_stopButton.trigger('click')
				} 
			}

			let x = timeToX(time)
			$_playBar.attr('transform', `translate(${x}, 0)`)
			$_playBar.attr('data-time', time)
			$_playBar.attr('data-x', x)

			pathsData.forEach( function(pathData) {
				if (x >= pathData.begin) {
					if(x <= pathData.end) {
						pathData.item.addClass('playing')
						pathData.sound.toMaster().start()

						for (let i = 0, j = pathData.linesData.length; i<j; i++ ) {
							let lineStartX = pathData.linesData[i][0]
							if (lineStartX <= x) {
								let lineEndX = pathData.linesData[i][1]

								if(pathData.linesData[i].mute){
									pathData.sound.volume.value = -Infinity
								} else {
									pathData.sound.volume.value = pathData.volume
									let lineStartY = pathData.linesData[i][2]
									let lineEndY = pathData.linesData[i][3]

									pathData.sound.frequency.value = yToFrequency(lineStartY)
									pathData.sound.frequency.rampTo(yToFrequency(lineEndY),xToTime(lineEndX-lineStartX))
								}
								pathData.linesData.splice(i,1)
								break;
							}
						}
					} else {
						pathData.item.removeClass('playing')
						pathData.sound.disconnect()
						pathData.sound.stop()
					}
				}
			})

		}
	}

	$_stopButton.on('click', function () {
		$_playBar.attr('transform', 'translate(0,0)')
		$_playBar.attr('data-time', 0)
		$_playBar.attr('data-x', 0)
		pauseTime = 0
		Tone.Transport.pause()
		Tone.Transport.cancel()

		if(play) $_playPauseButton.trigger('click')
		$('.sheet-group-content .playing').removeClass('playing')
		play = false

	})

	// Function that returns the frequency relative to the y of the point
	function yToFrequency(y){
		var steps = (editorHeight - y)/semitoneHeight;
		var frequency = minFrequency * Math.pow(seminoteConst,steps);
		return frequency.toFixed(2);
	}
	
	$(document).on('mousemove',function(event){
		let mouse = findSVGCoords(uniqueEvent(event))
		//console.log(mouse.y,yToFrequency(mouse.y)[0],yToFrequency(mouse.y)[1])
	})

	let resumePlaying = false

	$_playBar.on('mousedown', function(event) {
		let mouse = findSVGCoords(uniqueEvent(event))
		resumePlaying = play
		updateMusicData()
		if(play) $_playPauseButton.trigger('click')
		$(document).on('mousemove', movePlayBar)
		$(document).on('mouseup', endMovePlayBar) 
	})

	function movePlayBar (event) {
		let mouse = findSVGCoords(uniqueEvent(event))
		let x = Math.min(editingAreaWidth, Math.max(0, mouse.x+5))
		//let sheetX = Math.min(editingAreaWidth-sheetWidth, Math.max(0, mouse.x))
		$_playBar.attr('transform', `translate(${x}, 0)`)

		pathsData.forEach( function(pathData) {
			if (x >= pathData.begin &&  x <= pathData.end) {
				pathData.item.addClass('playing')
			} else {
				pathData.item.removeClass('playing')
			}
		})
	}

	function endMovePlayBar () {
		let mouse = findSVGCoords(uniqueEvent(event))
		let x = Math.min(editingAreaWidth, Math.max(0, mouse.x+5))
		$_playBar.attr('data-x', x)
		$_playBar.attr('data-time', xToTime(x))
		pauseTime = xToTime(x)
		if(resumePlaying) $_playPauseButton.trigger('click')
		$(document).off('mousemove', movePlayBar)
		$(document).off('mouseup', endMovePlayBar)
	}

	let previousSineX
	let previousSineY

  	
	let codeEditor = false
	let $_codeEditorContainer = $('#code-editor-container')

	$_codeEditorButton.on('click', function(e){
		updateEditorSize()
		if ($(this).hasClass('current')) {
			$_codeEditorButton.removeClass('current')
		} else {
			$(this).siblings('.button').removeClass('current')
			$_codeEditorButton.addClass('current')
		}
		
		$_codeEditorContainer.toggle()
		if (!codeEditor) {
			codeEditor = CodeMirror($('#code-text-area')[0], {lineNumbers : true, theme : 'monokai', mode : 'javascript', autoCloseBrackets : 'true', indentUnit : 4})
			showCodeMan()
		} else {
	  		codeEditor.setCursor(codeEditor.getCursor())
		}
	})

	let windowWidth = $(window).width()
	let prevWindowWidth = $(window).width()
	let windowHeight = $(window).height()


	function updateEditorSize(){
		let svgWidth = 1040
		windowWidth = $(window).width()
		windowHeight = $(window).height()
		let scale = windowWidth/svgWidth
		let zoomScale = windowWidth/prevWindowWidth
	
		$_codeEditorContainer.css({
			'font-size': `${scale*11}px`,
			top: parseFloat($_codeEditorContainer.css('top')) * zoomScale,
			left: parseFloat($_codeEditorContainer.css('left')) * zoomScale
		})
		if (codeEditor) {codeEditor.refresh()}

		prevWindowWidth = $(window).width()
	}

	$(window).on('resize orientationchange', updateEditorSize)
	updateEditorSize()

	$('#run-code-button').on('click', function(e) {
		let code = codeEditor.getValue()
		eval(code)
		codeEditor.replaceRange('\n/*DONE!\ndelete previous lines \nif you do not want \nto re-run it!*/\n',{line: Infinity})
	})

	/*---------- CODE EDITOR DEFAULT FUNCTIONS ----------*/

	let sineDefaultOptions = {
		x : 0,
		y : 50,
		shift : 0,
		amplitude : 50,
		period : 100, 
		duration : 150,
		approximation : 1
	}

	sineWave = function ( sineUserOptions ) {
		let options =  $.extend({}, sineDefaultOptions, sineUserOptions)
		previousSineX = options.x
		previousSineY = options.y
		let $_sineLinesGroup = $(document.createElementNS(svgns, 'g'))
			$_sineLinesGroup.attr({'data-begin-x': options.x, 'data-end-x' : options.duration + options.x})
		for ( let sineX = options.x + 1 ; sineX <= options.duration + options.x; sineX += options.approximation) {
			let sineB = sineX / (options.period / Math.PI / 2)
			let sineY = options.y + Math.sin(sineB + options.shift*Math.PI*2) * options.amplitude
			let $_line = $(document.createElementNS(svgns, 'line'))
				$_line.attr({'x1':previousSineX, 'x2':sineX, 'y1': previousSineY, 'y2':sineY, 'stroke': '#1D1D1D', 'stroke-width': 1})
			$_sineLinesGroup.append($_line)
			previousSineX = sineX
			previousSineY = sineY
		}
		$('.sheet-group.current .sheet-group-content').append($_sineLinesGroup)
		//updateMusicData()
	}

	let straightDefaultOptions = {
		beginX : 0,
		beginY : 50,
		endX : 150,
		endY: 100
	}

	straightLine = function(straightUserOptions) {
		let options =  $.extend({}, straightDefaultOptions, straightUserOptions)
		let lineLength = options.endX - options.beginX
		let numberOfSegments = Math.round(lineLength/straightSegmentLength)

		previousX = options.beginX
		previousY = options.beginY

		let segmentsDeltaX = (options.endX-previousX)/numberOfSegments
		let segmentsDeltaY = (options.endY-previousY)/numberOfSegments
		

		let $_straightLinesGroup = $(document.createElementNS(svgns, 'g'))
			$_straightLinesGroup.attr({'data-begin-x': options.beginX, 'data-end-x' : options.endX + options.beginX})
		for ( let i = 0; i < numberOfSegments; i++ ) {
			$_line = $(document.createElementNS(svgns, 'line'))
			$_line.attr('stroke', 'black')
			$_line.attr('stroke-width', 1)
			$_line.attr('stroke-linecap', 'round')
			$_line.attr('x1', previousX + segmentsDeltaX*i)
			$_line.attr('y1', previousY + segmentsDeltaY*i)
			$_line.attr('x2', previousX + segmentsDeltaX*(i+1))
			$_line.attr('y2', previousY + segmentsDeltaY*(i+1))
			$_straightLinesGroup.append($_line)
		}
		$('.sheet-group.current .sheet-group-content').append($_straightLinesGroup)
		updateMusicData()
	}
	let newSheetDefaultOptions = {
		x: 0,
		y: 0
	}

	newSheet = function (newSheetUserOptions) {
		let options =  $.extend({}, newSheetDefaultOptions, newSheetUserOptions)
		$('.sheet-group.current').removeClass('current')
		hideInterface()
		createSheet(options.x, options.y)
		showInterface($('.sheet-group.current'))
		addLevel($('.sheet-group.current'))
	}

	$('#close-editor-button').on('click', function (e) {
		$('#code-editor-container').toggle('display')
		$_codeEditorButton.removeClass('current')
	})

	let codeMan = '/*\nWRITE YOUR CODE BELOW THIS TEXT\n+++++++++++++++++++++++++++++\nHack the SBLBL! INSTRUCTIONS:\n+++++++++++++++++++++++++++++\nCode in Javascript and control mathematically your music!\nBy default, you gonna edit the current sheet.\nBelow there are some basic functions. Copy and paste them, then run.\nYou can modify the values in order to change the drawing.\nValues not specified are set to default, so, writing:\n\'sineWave()\' equals to writing the basic function.\n\nDEFAULT FUNCTIONS\n++++++++++++++++++\n\nSine wave drawing:\n------------------\nsineWave({x: 0, y: 50, shift: 0, amplitude: 50, period: 100,  duration: 150, approximation: 1})\n\nstraight line drawing:\n----------------------\nstraightLine({ beginX: 0, beginY: 50, endX: 150, endY: 100})\n*/\n//WRITE YOUR CODE HERE!\n'

	function showCodeMan () {
		codeEditor.replaceRange( `${codeMan}`, {line: Infinity})
	}

	let codeEditorPrevX
	let codeEditorPrevY
	let mouseStartY

	$('#code-editor-frame').on('mousedown', function(e) {
		event.stopImmediatePropagation()
		let mouse = uniqueEvent(event)
		mouseStartX = mouse.x
		mouseStartY = mouse.y
		codeEditorPrevX = parseFloat($_codeEditorContainer.css('left'))
		codeEditorPrevY = parseFloat($_codeEditorContainer.css('top'))
		$(document).on('mousemove', moveCodeEditor)
		$(document).on('mouseup', endMoveCodeEditor)
		$_codeEditorContainer.attr('cursor', 'grabbing')
	})

	function moveCodeEditor () {
		event.stopImmediatePropagation()
		let mouse = uniqueEvent(event)
		let mouseDeltaX = mouse.x - mouseStartX
		let mouseDeltaY = mouse.y - mouseStartY
		let codeEditorWidth = parseFloat($_codeEditorContainer.width())
		let codeEditorHeight = parseFloat($_codeEditorContainer.height())
		let codeEditorX = Math.min(windowWidth-codeEditorWidth, Math.max(0, codeEditorPrevX + mouseDeltaX))
		let codeEditorY = Math.min(windowHeight-codeEditorHeight, Math.max(0, codeEditorPrevY + mouseDeltaY))

		$_codeEditorContainer.css({left: codeEditorX, top: codeEditorY})
	}

	function endMoveCodeEditor () {
		$(document).off('mousemove', moveCodeEditor)
		$(document).off('mouseup', endMoveCodeEditor)
		$(document).attr('cursor', 'auto')
	}
	let codeEditorPrevWidth
	let codeEditorPrevHeight
	$_codeEditorTransformButton.on('mousedown', function(e) {
		event.stopImmediatePropagation()
		let mouse = uniqueEvent(event)
		mouseStartX = mouse.x
		mouseStartY = mouse.y
		codeEditorPrevX = parseFloat($_codeEditorContainer.css('left'))
		codeEditorPrevY = parseFloat($_codeEditorContainer.css('top'))
		codeEditorPrevWidth = parseFloat($_codeEditorContainer.width())
		codeEditorPrevHeight = parseFloat($_codeEditorContainer.height())
		$(document).on('mousemove', transformCodeEditor)
		$(document).on('mouseup', endTransformCodeEditor)
		$_codeEditorContainer.attr('cursor', 'grabbing')
	})

	function transformCodeEditor () {
		event.stopImmediatePropagation()
		let mouse = uniqueEvent(event)
		let mouseDeltaX = mouse.x - mouseStartX
		let mouseDeltaY = mouse.y - mouseStartY
		let codeEditorWidth = Math.min(windowWidth-codeEditorPrevX, Math.max(100, codeEditorPrevWidth + mouseDeltaX))
		let codeEditorHeight = Math.min(windowHeight-codeEditorPrevY, Math.max(100, codeEditorPrevHeight + mouseDeltaY))

		$_codeEditorContainer.css({width: codeEditorWidth, height: codeEditorHeight})
	}

	function endTransformCodeEditor () {
		$(document).off('mousemove', transformCodeEditor)
		$(document).off('mouseup', endTransformCodeEditor)
		let svgWidth = 1040
		let scale = windowWidth/svgWidth

		$_codeEditorContainer.css({width: $_codeEditorContainer.width()/(11*scale) + 'em', height: $_codeEditorContainer.height()/(11*scale) + 'em'})

		$(document).attr('cursor', 'auto')
	}
	
})





/*
	- le note nascoste suonano lo stesso
    - la barra si sballa con il bpm
    - reference BELOW invece che ABOVE
*/
