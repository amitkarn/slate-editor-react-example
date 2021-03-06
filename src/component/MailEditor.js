import React from "react";
import {Editor,getEventTransfer} from "slate-react";
import { isKeyHotkey } from 'is-hotkey';
import ReactDOM from 'react-dom';
import isUrl from 'is-url'
import "./MailEditor.css";
import {Button as BootstrapButton} from "react-bootstrap";
import Html from 'slate-html-serializer';
import {Rules,Schema} from "../config/EditorConfig";
import {FileAttachment, FontSize, Button, Icon, 
		Toolbar, Image, LinkModal, ImageModal, EmailInput} from "./index";
		
/**
 * Create a new HTML serializer with `RULES`.
 * @type {Html}
 */
const html = new Html({ rules: Rules })

/**
 * A change function to standardize inserting images.
 * @param {Editor} editor
 * @param {String} src
 * @param {Range} target
 */
function insertImage(editor, src, target) {
	if (target) {
		editor.select(target)
	}
	editor.insertBlock({
		type: 'image',
		data: { src },
	})
}

/**
 * A change helper to standardize wrapping links.
 * @param {Editor} editor
 * @param {String} href
 */
function wrapLink(editor, href) {
	editor.wrapInline({
		type: 'link',
		data: { href },
	})
	editor.moveToEnd()
}

/**
 * A change helper to standardize unwrapping links.
 * @param {Editor} editor
 */
function unwrapLink(editor) {
	editor.unwrapInline('link')
}

/**
 * Define the default node type.
 * @type {String}
 */
const DEFAULT_NODE = 'paragraph'

/**
 * Define hotkey matchers.
 * @type {Function}
 */
const isBoldHotkey = isKeyHotkey('mod+b')
const isItalicHotkey = isKeyHotkey('mod+i')
const isUnderlinedHotkey = isKeyHotkey('mod+u')
const isCodeHotkey = isKeyHotkey('mod+`')

class MailEditor extends React.Component{
	componentWillReceiveProps(nextProps){
		if (this.props.initialValue !== nextProps.initialValue) {
			this.setState({value:html.deserialize(nextProps.initialValue)})
		}
	}

	state={
		subject:"",
		toAddrFieldVal:"",
		toAddr:[],
		imageUrl:"",
		value:html.deserialize(this.props.initialValue),
		fileDetails:[
			{src:"C:\fakepath\filesrc1",size:"$12M",name:"378924372891"},
			{src:"C:\fakepath\filesrc2",size:"$12M",name:"378924372892"},
			{src:"C:\fakepath\filesrc3",size:"$12M",name:"378924372893"},
			{src:"C:\fakepath\filesrc4",size:"$12M",name:"378924372894"},
			{src:"C:\fakepath\filesrc5",size:"$12M",name:"378924372895"},
			{src:"C:\fakepath\filesrc6",size:"$12M",name:"378924372896"},
			{src:"C:\fakepath\filesrc7",size:"$12M",name:"378924372897"},
			{src:"C:\fakepath\filesrc8",size:"$12M",name:"378924372898"},
			{src:"C:\fakepath\filesrc9",size:"$12M",name:"378924372899"},
			{src:"C:\fakepath\filesrc10",size:"$12M",name:"3789243728910"}
		],
		isLinkModalOpen:false,
		linkDetails:{text:"",url:"",isSelectedText:false},
		isImageModalOpen:false
	}

	/**
	* Check whether the current selection has a link in it.
	* @return {Boolean} hasLinks
	*/
	hasLinks = () => {
		const { value } = this.state
		return value.inlines.some(inline => inline.type === 'link')
	}

	/* Check if the current selection has a mark with `type` in it.
	@param {String} type
	@return {Boolean} */
	hasMark = type => {
		const { value } = this.state
		return value.activeMarks.some(mark => mark.type === type)
	}

	/*Check if the any of the currently selected blocks are of `type`.
	@param {String} type
	@return {Boolean}
	*/
	hasBlock = type => {
		const { value } = this.state
		return value.blocks.some(node => node.type === type)
	}


	/*Store a reference to the `editor`.
	@param {Editor} editor
	*/
	ref = editor => {this.editor = editor}

	render(){
		return(
			<div>
				<EmailInput 
					removeEmail={this.removeEmail}
					type="toAddr"
					addToAddr={this.addToAddr}
					onToAddrChange={this.onToAddrChange}
					toAddr={this.state.toAddr} 
					toAddrFieldVal={this.state.toAddrFieldVal} />
				
				<div className="subjectDiv">
					<input type="text" value={this.subject} onChange={this.onSubjectChange} placeholder="Subject" />
				</div>
				<div className="mail-editor-container">
					<Editor
						className="mail-editor"
						spellCheck
						autoFocus
						ref={this.ref}
						value={this.state.value}
						onPaste={this.onPaste}
						onChange={this.onChange}
						onKeyDown={this.onKeyDown}
						renderNode={this.renderNode}
						renderMark={this.renderMark}
						addLink={this.addLink}
						schema={Schema}
					/>
					<div className="file-attachment-container">
						{this.state.fileDetails.length>0 && 
							<div className="file-count-label">
								Invoice Attachments
								({this.state.fileDetails.length})
							</div>
						}
						{this.state.fileDetails.map(
							(fileDetail,index)=> <FileAttachment 
													key={fileDetail.name+"_"+index}
													removeAttachment={this.removeAttachment} 
													src={fileDetail.src} 
													filename={fileDetail.name} 
													fileSize={fileDetail.size} />					
						)}
					</div>
				</div>
				<Toolbar>
					{this.renderMarkButton('font-size', 'format_size')}
					{this.renderMarkButton('bold', 'format_bold')}
					{this.renderMarkButton('italic', 'format_italic')}
					{this.renderMarkButton('underlined', 'format_underlined')}
					{this.renderMarkButton('code', 'code')}
					{this.renderBlockButton('block-quote', 'format_quote')}
					{this.renderBlockButton('numbered-list', 'format_list_numbered')}
					{this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
					{this.renderBlockButton('link', 'link')}
					{this.renderBlockButton('image', 'insert_photo')}
				</Toolbar>
				<div className="footerDiv">
					<div className="fileAttachmentIconDiv">
						{this.renderBlockButton('file', 'attachment')}
						<span onMouseDown={event => this.onClickBlock(event, "file")} 
							className="attachInvoiceLabel">
							Attach Invoices
						</span>
					</div>
					<BootstrapButton className="sendButton" onClick={this.sendMail}>SEND</BootstrapButton>
				</div>
				<ImageModal 
					imageUrl={this.imageUrl}
					addImage={this.addImage}
					imageUrlChange={this.imageUrlChange}
					toggleImageModal={this.toggleImageModal} 
					isImageModalOpen={this.state.isImageModalOpen}/>
				<LinkModal 
					linkDetails={this.state.linkDetails}
					linkContentChange={this.linkContentChange}
					toggleLinkModal={this.toggleLinkModal} 
					addLink={this.addLink}
					isLinkModalOpen={this.state.isLinkModalOpen}/>
			</div>
		)
	}

	/* onclick method for send button */
	sendMail=()=>{
		console.log(this.state.toAddr)
		console.log(this.state.subject)
		console.log(html.serialize(this.state.value))
	}

	/*remove email*/
	removeEmail=(email,type)=>{
		let fieldName=type;
		this.setState({[fieldName]: this.state[fieldName].filter(function(val) { 
			return email!==val
		})});
	}

	/*on change method for subject input*/
	onSubjectChange=(e)=>{
		this.setState({subject:e.target.value})
	}

	/*on change method for email input*/
	onToAddrChange=(e)=>{
		this.setState({toAddrFieldVal:e.target.value})
	}

	/*key press method for email input*/
	addToAddr=(e)=>{
		if(e.key==='Enter'){
			let email=this.state.toAddrFieldVal;
			this.setState({toAddr:[...this.state.toAddr,email],toAddrFieldVal:""})
		}
	}

	/*insert text as link to editor*/
	addLink = (e) =>{
		this.toggleLinkModal()
		const {editor}=this
		const href = this.state.linkDetails.url.trim()
		if (href === null || href.length===0) {
			this.setState({linkDetails:{url:"",text:"",isSelectedText:false}})
			return
		}
		if(this.state.linkDetails.isSelectedText){
			this.setState({linkDetails:{url:"",text:"",isSelectedText:false}},
				()=>{editor.command(wrapLink, href)})
		}else{
			const text = this.state.linkDetails.text.trim()
			if (text === null || text.length===0) {
				this.setState({linkDetails:{url:"",text:"",isSelectedText:false}})
				return
			}
			this.setState({linkDetails:{url:"",text:"",isSelectedText:false}},()=>{editor
				.insertText(text)
				.moveFocusBackward(text.length)
				.command(wrapLink, href)})
		}
	}

	/*change method for link modal input fields*/
	linkContentChange=(e,field)=>{
		this.setState({linkDetails:{...this.state.linkDetails,[field]:e.target.value}})
	}

	/*change method for image url in modal*/
	imageUrlChange=(e)=>{
		this.setState({imageUrl:e.target.value})
	}

	/*add image in the editor*/
	addImage=(e)=>{
		this.toggleImageModal()
		const {editor} = this
		const src = this.state.imageUrl
		if (!src) return
		this.setState({imageUrl:""},()=>{editor.command(insertImage, src)})
	}

	/**
	 * Render a mark-toggling toolbar button.
	 * @param {String} type
	 * @param {String} icon
	 * @return {Element}
	 */
	renderMarkButton = (type, icon) => {
		const isActive = this.hasMark(type)
		return(
			<Button active={isActive}
					onMouseDown={event=>this.onClickMark(event, type)}>
				{type==="font-size" && <FontSize hasMark={this.hasMark} onClickMark={this.onClickMark} icon={icon} />}
				{type!=="font-size" && <Icon>{icon}</Icon>} 
			</Button>
		)
	}

	/**
	 * Render a block-toggling toolbar button.
	 * @param {String} type
	 * @param {String} icon
	 * @return {Element}
	 */
	renderBlockButton = (type, icon) => {
		let isActive = this.hasBlock(type)
		if (['numbered-list', 'bulleted-list'].includes(type)) {
			const {value: {document,blocks}} = this.state
			if (blocks.size > 0) {
				const parent = document.getParent(blocks.first().key)
				isActive = this.hasBlock('list-item') && parent && parent.type === type
			}
		}
		return( 
			<Button active={isActive}
				onMouseDown={event => this.onClickBlock(event, type)}>
				{type==='file' && <input id="fileInput" ref="fileInput" onChange={(e)=>this.addFile(e)} type="file" style={{display:"none"}} />}
				<Icon>{icon}</Icon>
			</Button>
		)
	}

	/*append new file details to the state*/
	addFile = (e) => {
		let file = e.target.files[0];
		if(!file)
			return
		let fileSrc=e.target.value;
		this.setState(
			{fileDetails: [...this.state.fileDetails,{src:fileSrc,size:file.size,name:file.name}]}
		);
	}

	/**
	 * Render a Slate node.
	 * @param {Object} props
	 * @return {Element}
	 */
	renderNode = (props, editor, next) => {
		const {attributes,children,node,isFocused}=props
		switch (node.type) {
			case 'block-quote':
				return <blockquote { ...attributes} >{children}</blockquote>
			case 'bulleted-list':
				return <ul { ...attributes}>{children}</ul>
			case 'list-item':
				return <li { ...attributes}>{children}</li>
			case 'numbered-list':
				return <ol { ...attributes}>{children}</ol>
			case 'link': {
				const { data } = node
				const href = data.get('href')
				return <a className="textLink" {...attributes} href={href}>{children}</a>
			}
			case 'image': 
				const src = node.data.get('src')
				return <Image src={src} selected={isFocused} {...attributes} />
			default:
				return next()
		}
	}

	/*remove file details from the state*/
	removeAttachment = (src) =>{
		this.setState(prevState => ({
			fileDetails: prevState.fileDetails.filter(fileDetail => fileDetail.src !== src )
		}));
	}

	/**
	 * Render a Slate mark.
	 * @param {Object} props
	 * @return {Element}
	 */
	renderMark = (props, editor, next) => {
		const {children,mark,attributes}=props
		switch (mark.type) {
			case 'bold':
				return <strong { ...attributes}>{children}</strong>
			case 'code':
				return <code { ...attributes}>{children}</code>
			case 'italic':
				return <em { ...attributes}>{children}</em>
			case 'underlined':
				return <u { ...attributes}>{children}</u>
			case 'small-size':
				return <font size='1' {...attributes}>{children}</font>
			case 'large-size':
				return <font size='4' {...attributes}>{children}</font>
			default:
				return next()
		}
	}

	/**
	 * On change, save the new `value`.
	 * @param {Editor} editor
	 */
	onChange = ({value}) => {
		if (value.document !== this.state.value.document) {
			//const content = JSON.stringify(value.toJSON())
			const content=html.serialize(value)
			localStorage.setItem('content', content)
		}
		this.setState({value})
	}

	/**
	 * On key down, if it's a formatting command toggle a mark.
	 * @param {Event} event
	 * @param {Editor} editor
	 * @return {Change}
	 */
	onKeyDown = (event, editor, next) => {
		let mark;
		if (isBoldHotkey(event)) {
			mark = 'bold'
		} else if (isItalicHotkey(event)) {
			mark = 'italic'
		} else if (isUnderlinedHotkey(event)) {
			mark = 'underlined'
		} else if (isCodeHotkey(event)) {
			mark = 'code'
		} else {
			try{
				return next()
			}catch(err){
				return editor
			}
		}
		event.preventDefault()
		editor.toggleMark(mark)
	}

	/*to show or hide modal to get details to insert link*/
	toggleLinkModal = () =>{
		this.setState(prevState => ({isLinkModalOpen: !prevState.isLinkModalOpen}));
	}

	/*to show or hide modal to get details to insert image*/
	toggleImageModal = () =>{
		this.setState(prevState => ({isImageModalOpen: !prevState.isImageModalOpen}));
	}

	/**
	 * When a mark button is clicked, toggle the current mark.
	 * @param {Event} event
	 * @param {String} type
	 */
	onClickMark = (event, type) => {
		event.preventDefault()
		if(type==="font-size"){
			return
		}else if(type==="small-size"){
			if(this.hasMark("normal-size")){
				this.editor.toggleMark("normal-size")		
			} else if(this.hasMark("large-size")){
				this.editor.toggleMark("large-size")		
			}
		} else if(type==="normal-size"){
			if(this.hasMark("small-size")){
				this.editor.toggleMark("small-size")		
			} else if(this.hasMark("large-size")){
				this.editor.toggleMark("large-size")		
			}
		} else if(type==="large-size"){
			if(this.hasMark("small-size")){
				this.editor.toggleMark("small-size")		
			} else if(this.hasMark("normal-size")){
				this.editor.toggleMark("normal-size")		
			}
		}
		this.editor.toggleMark(type)
	}

	/**
	 * When a block button is clicked, toggle the block type.
	 * @param {Event} event
	 * @param {String} type
	 */
	onClickBlock = (event, type) => {
		event.preventDefault();
		const {editor}=this
		const {value} = editor
		const {document} = value

		if(type==="file"){
			ReactDOM.findDOMNode(this.refs.fileInput).click()
		} else if(type==="image"){
			this.toggleImageModal()
		} else if(type==='link'){
			const hasLinks = this.hasLinks()
			if (hasLinks) {
				editor.command(unwrapLink)
			} else if (value.selection.isExpanded) {
				this.setState({linkDetails:{...this.state.linkDetails,isSelectedText:true}})
				this.toggleLinkModal()
			} else {
				this.toggleLinkModal()
			}
		} else if (type !== 'bulleted-list' && type !== 'numbered-list') {
			const isActive = this.hasBlock(type)
			const isList = this.hasBlock('list-item')
			if (isList) {
				editor
					.setBlocks(isActive ? DEFAULT_NODE : type)
					.unwrapBlock('bulleted-list')
					.unwrapBlock('numbered-list')
			} else {
				editor.setBlocks(isActive ? DEFAULT_NODE : type)
			}
		} else {
			// Handle the extra wrapping required for list buttons.
			const isList = this.hasBlock('list-item')
			const isType = value.blocks.some(block => {
				return !!document.getClosest(block.key, parent => parent.type === type)
			})

			if (isList && isType) {
				editor
					.setBlocks(DEFAULT_NODE)
					.unwrapBlock('bulleted-list')
					.unwrapBlock('numbered-list')
			} else if (isList) {
				editor
					.unwrapBlock(
						type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
					)
					.wrapBlock(type)
			} else {
				editor.setBlocks('list-item').wrapBlock(type)
			}
		}
	}

	/**
	* On paste, if the text is a link, wrap the selection in a link.
	* @param {Event} event
	* @param {Editor} editor
	* @param {Function} next
	*/
	onPaste = (event, editor, next) => {
		if (editor.value.selection.isCollapsed) return next()
		const transfer = getEventTransfer(event)
		const { type, text } = transfer
		if (type !== 'text' && type !== 'html') return next()
		if (!isUrl(text)) return next()
		if (this.hasLinks()) {
			editor.command(unwrapLink)
		}
		editor.command(wrapLink, text)
	}
}


export default MailEditor;