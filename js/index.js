let RENDERER = {
	SLEEP_COUNT : 60,
	SLEEP_COUNTDOWN : 600,
	LAUGH_COUNT : 20,
	LAUGH_COUNTDOWN : {min : 50, max : 200},
	WAVE_COUNT : 10,
	WAVE_COUNTDOWN : {min : 50, max : 200},
	WAVE_LOOP_COUNT : {min : 1, max : 5},
	ROTATE_COUNT : 100,
	ROTATE_COUNTDOWN : {min : 300, max : 600},
	ZZZ_COUNT : 60,
	SURPRISING_VELOCITY : -20,
	GRAVITY : 1,
	GAZE_DISTANCE : 10,
	FONT : "italic bold",
	
	init : function() {
		this.setParameters();
		this.reconstructMethod();
		this.bindEvent();
		this.render();
	},

	setParameters : function() {
		this.theWindow = $(window);
		this.container = $("#js-seal-container");
		this.width = this.container.width();
		this.height = this.container.height();
		this.center = {x : this.width / 2, y : this.height / 2};
		this.context = $("<canvas />").attr({width : this.width, height : this.height}).appendTo(this.container).get(0).getContext("2d");
		
		this.sleeping = false;
		this.sleepped = false;
		this.surprising = false;
		this.laughing = false;
		this.leftWaving = false;
		this.rightWaving = false;
		this.rotating = false;
		this.positionY = this.center.y;
		this.velocity = this.SURPRISING_VELOCITY;
		this.sleepCountDown = this.SLEEP_COUNTDOWN;
		this.sleepCount = this.SLEEP_COUNT;
		this.zzzCount = this.ZZZ_COUNT;
		this.zzzTheta = 0;
		
		this.laughCountDown = this.getRandomValue(this.LAUGH_COUNTDOWN);
		this.laughCount = this.LAUGH_COUNT;
		this.leftWaveCountDown = this.getRandomValue(this.WAVE_COUNTDOWN);
		this.leftWaveCount = this.WAVE_COUNT;
		this.leftWaveLoopCount = this.getRandomValue(this.WAVE_LOOP_COUNT);
		this.rightWaveCountDown = this.getRandomValue(this.WAVE_COUNTDOWN);
		this.rightWaveCount = this.WAVE_COUNT;
		this.rightWaveLoopCount = this.getRandomValue(this.WAVE_LOOP_COUNT);
		
		this.rotateCountDown = this.getRandomValue(this.ROTATE_COUNTDOWN);
		this.rotateCount = this.ROTATE_COUNT;
		this.direction = 1;
		this.theta = 0;
		this.phi = 0;
	},
	getRandomValue : function(range) {
		return range.min + (range.max - range.min) * Math.random() | 0;
	},
	reconstructMethod : function() {
		this.wakeup = this.wakeup.bind(this);
		this.watchPointer = this.watchPointer.bind(this);
		this.render = this.render.bind(this);
	},
	bindEvent : function() {
		this.container.on("click", this.wakeup);
		this.container.on("mousemove", this.watchPointer);
	},
	setSleepStatus : function() {
		this.sleepCountDown = this.SLEEP_COUNTDOWN;
		this.zzzCount = this.ZZZ_COUNT;
		this.zzzTheta = Math.PI * (1- Math.random() * 2) / 4;
	},
	wakeup : function(event) {
		if (this.sleepped && this.judgeWakeupArea(this.judgeDirection(event))){
			this.sleeping = false;
			this.sleepped = false;
			this.surprising = true;
		}
	},
	watchPointer : function(event) {
		let direction = this.judgeDirection(event);
		
		this.container.css("cursor", this.judgeWakeupArea(direction) && this.sleeping ? "pointer" : "default");
		
		if(this.sleeping || this.rotating || this.surprising){
			this.phi = 0;
			return;
		}
		this.phi = (Math.atan2(direction.dy, direction.dx) + Math.PI * 5 / 2) % (Math.PI * 2);
		
		if(Math.abs(this.theta) >= Math.PI / 2 && Math.abs(this.theta) <= Math.PI * 3 / 2){
			this.phi += Math.PI;
			this.phi %= Math.PI * 2;
		}
	},
	judgeDirection : function(event) {
		let offset = this.container.offset(),
			x = event.clientX - offset.left + this.theWindow.scrollLeft(),
			y = event.clientY - offset.top + this.theWindow.scrollTop();
			
		return {dx : x - this.center.x, dy : y - this.center.y};
	},
	judgeWakeupArea : function(direction) {
		return direction.dx * direction.dx + direction.dy * direction.dy <= 50 * 50;
	},
	render : function() {
		requestAnimationFrame(this.render);
		this.context.clearRect(0, 0, this.width, this.height);
		this.context.save();
		
		if(this.surprising){
			this.context.translate(this.center.x, this.positionY);
			this.positionY += this.velocity;
			this.velocity += this.GRAVITY;
			
			if(this.positionY > this.center.y) {
				this.positionY = this.center.y;
				this.velocity = this.SURPRISING_VELOCITY;
				this.surprising = false;
			}
		}else{
			this.context.translate(this.center.x, this.center.y);
		}
		this.context.rotate(this.theta);
		this.context.lineJoin = "round";
		
		this.drawHand(-1);
		this.drawHand(1);
		this.drawOutline();
		this.context.save();
		this.context.translate(this.GAZE_DISTANCE * Math.sin(this.phi), -this.GAZE_DISTANCE * Math.cos(this.phi) - 10);
		this.drawEye(-1);
		this.drawEye(1);
		this.drawMouth();
		this.drawBeard(-1);
		this.drawBeard(1);
		this.drawNose();
		this.context.restore();
		this.drawZZZ();
		this.context.restore();
		this.drawGround();
		this.controlStatus();
	},
	drawGround : function() {
		this.context.save();
		this.context.beginPath();
		this.context.fillStyle = "#F0F0F0";
		
		let translateX = -this.theta / Math.PI * this.width / 2;
		
		if (translateX < -this.width / 2) {
			translateX += this.width;
		} else if (translateX > this.width / 2) {
			translateX -= this.width;
		}

		this.context.translate(translateX,  0);
		this.context.moveTo(-this.width / 2, this.center.y + 55);
		
		for (let i = 0; i < 2; i++) {
			this.context.bezierCurveTo(this.width * (i - 1 / 6), this.center.y + 15, this.width * (i + 1 / 6), this.center.y + 95, this.width * (i + 1 / 2), this.center.y + 55);
		}
		this.context.lineTo(this.width * 1.5, this.height);
		this.context.lineTo(-this.width / 2, this.height);
		this.context.closePath();
		this.context.fill();
		this.context.restore();
	},
	controlStatus : function() {
		this.controlSleepStatus();
		this.controlLaughStatus();
		this.controlWaveStatus();
		this.controlRotateStatus();
	},
	controlSleepStatus : function() {
		if (!this.surprising && !this.laughing && !this.leftWaving && !this.rightWaving && !this.rotating && this.sleepCountDown >= 0){
			if (this.sleepCountDown-- <= 0) {
				this.sleeping = true;
				this.sleepCount = this.SLEEP_COUNT;
				this.phi = 0;
			}
		}
		
		if(this.sleeping && this.sleepCount >= 0) {
			this.sleepCount--;
			
			if (this.sleepCount == 0) {
				this.setSleepStatus();
			}
		}

		if (!this.sleeping && this.sleepCount <= this.SLEEP_COUNT) {
			this.sleepCount++;
		}
	},
	controlLaughStatus : function(){
		if(!this.surprising && !this.sleeping && this.laughCountDown >= 0){
			if(this.laughCountDown-- <= 0){
				this.laughing = true;
				this.laughCount = this.LAUGH_COUNT;;
			}
		}
		if(this.laughing && this.laughCount >= 0){
			this.laughCount--;
		}
		if(!this.laughing && this.laughCount <= this.LAUGH_COUNT){
			this.laughCount++;
		}
	},
	controlWaveStatus : function(){
		if(!this.surprising && !this.sleeping && this.leftWaveCountDown >= 0){
			if(this.leftWaveCountDown-- <= 0){
				this.leftWaving = true;
				this.leftWaveCount = this.WAVE_COUNT;
			}
		}
		if(this.leftWaving && this.leftWaveCount >= 0){
			this.leftWaveCount--;
		}
		if(!this.leftWaving && this.leftWaveCount <= this.WAVE_COUNT){
			this.leftWaveCount++;
		}
		if(!this.sleeping && this.rightWaveCountDown >= 0){
			if(this.rightWaveCountDown-- <= 0){
				this.rightWaving = true;
				this.rightWaveCount = this.WAVE_COUNT;
			}
		}
		if(this.rightWaving && this.rightWaveCount >= 0){
			this.rightWaveCount--;
		}
		if(!this.rightWaving && this.rightWaveCount <= this.WAVE_COUNT){
			this.rightWaveCount++;
		}
	},
	controlRotateStatus : function(){
		if(!this.surprising && !this.sleeping && this.rotateCountDown >= 0){
			if(this.rotateCountDown-- <= 0){
				this.rotating = true;
				this.rotateCount = this.ROTATE_COUNT;
				this.phi = 0;
			}
		}
		if(this.rotating && this.rotateCount >= 0){
			this.rotateCount--;
			
			if(this.rotateCount < 0){
				this.rotating = false;
				this.rotateCountDown = this.getRandomValue(this.ROTATE_COUNTDOWN);
				this.rotateCount = this.ROTATE_COUNT;
				this.direction = (Math.random() < 0.5) ? 1  : -1;
			}
		}
		if(this.rotating){
			this.theta += 1 / this.ROTATE_COUNT * Math.PI * this.direction;
			this.theta %= Math.PI * 2;
		}
	},
	drawHand : function(offset){
		this.context.beginPath();
		this.context.lineWidth = 3;
		this.context.lineJoin = "round";
		this.context.strokeStyle = "#DDDDDD";
		this.context.fillStyle = "#DDDDDD";
		this.context.moveTo(70 * offset, 30);
		
		let rate = this.sleeping ? 0 : (this.WAVE_COUNT - ((offset == -1) ? this.leftWaveCount : this.rightWaveCount)) / this.WAVE_COUNT,
			waveLoopCount = (offset == -1) ? "leftWaveLoopCount" : "rightWaveLoopCount",
			waveCountDown = (offset == -1) ? "leftWaveCountDown" : "rightWaveCountDown",
			waving = (offset == -1) ? "leftWaving" : "rightWaving";
			
		this.context.bezierCurveTo(100 * offset, 40 - 10 * rate, 120 * offset, 50 - 20 * rate, 140 * offset, 60 - 30 * rate);
		this.context.bezierCurveTo(120 * offset, 60 - 20 * rate, 100 * offset, 50 - 10 * rate, 70 * offset, 50);
		
		if(!this.sleeping && rate == 1 && this[waving]){
			if(--this[waveLoopCount] >= 0){
				this[waveCountDown] = 1;
			}else{
				this[waveCountDown] = this.getRandomValue(this.WAVE_COUNTDOWN);
				this[waveLoopCount] = this.getRandomValue(this.WAVE_LOOP_COUNT);
			}
			this[waving] = false;
		}
		this.context.closePath();
		this.context.stroke();
		this.context.fill();
	},
	drawOutline : function(){
		this.context.save();
		this.context.scale(1, 0.8);
		this.context.beginPath();
		this.context.fillStyle = "#FFFFFF";
		this.context.arc(0, 0, 100, 0, Math.PI * 2, false);
		this.context.fill();
		this.context.restore();
		
		this.context.save();
		this.context.translate(this.GAZE_DISTANCE / 2 * Math.sin(this.phi), -this.GAZE_DISTANCE / 2 * Math.cos(this.phi));
		this.context.beginPath();
		this.context.fillStyle = "#EEEEEE";
		this.context.arc(0, 0, 50, 0, Math.PI * 2, false);
		this.context.fill();
		this.context.restore();
	},
	drawEye : function(offset){
		let sin = 2 * Math.sin(this.phi),
			cos = -2 * Math.cos(this.phi),
			gradient = this.context.createRadialGradient(20 * offset + sin, -8 + cos, 0, 20 * offset + sin, -8 + cos, 30),
			rate = this.sleeping ? (this.SLEEP_COUNT - this.sleepCount) / this.SLEEP_COUNT : 0;
		
		gradient.addColorStop(0, "#FFFFFF");
		gradient.addColorStop(0.1, "#000000");
		gradient.addColorStop(1, "#000000");
		
		this.context.beginPath();
		this.context.fillStyle = gradient;
		this.context.strokeStyle = "#000000";
		this.context.lineWidth = 3;
		this.context.moveTo(30 * offset, 5);
		this.context.bezierCurveTo(35 * offset, -13 + 16 * rate, 15 * offset, -20 + 10 * rate, 10 * offset, -3);
		this.context.bezierCurveTo(15 * offset, 5 - 15 * rate, 30 * offset, 10 - 8 * rate, 30 * offset, 5);
		this.context.fill();
		this.context.stroke();
	},
	drawMouth : function(){
		this.context.save();
		this.context.beginPath();
		this.context.translate(0, 35);
		this.context.scale(1, 0.6);
		this.context.fillStyle = "#000000";
		this.context.arc(0, 0, 20, 0, Math.PI * 2, false);
		this.context.fill();
		this.context.restore();
	},
	drawBeard : function(offset){
		this.context.beginPath();
		this.context.fillStyle = "#DDDDDD";
		this.context.strokeStyle = "#CCCCCC";
		
		let rate = (this.LAUGH_COUNT - this.laughCount) / this.LAUGH_COUNT;
		
		if(!this.sleeping && rate == 1 && this.laughing){
			this.laughCountDown = this.getRandomValue(this.LAUGH_COUNTDOWN);
			this.laughing = false;
		}
		this.context.moveTo(0, 15 + 5 * rate);
		this.context.lineTo(0, 40 - 10 * rate);
		this.context.bezierCurveTo(40 * offset, 55 - 5 * rate, 40 * offset, 5 - 25 * rate, 0 * offset, 15 - 10 * rate);
		this.context.fill();
		this.context.stroke();
		
		for(let i = 0; i < 5; i++){
			this.context.beginPath();
			this.context.lineWidth = 1;
			this.context.strokeStyle = "#CCCCCC";
			this.context.moveTo(20 * offset, 20 + i * 3 - 10 * rate);
			this.context.bezierCurveTo((40 - i * 3) * offset, 25 + i * 4 - 15 * rate, (50 - i * 3) * offset, 30 + i * 5 - 20 * rate, (60 - i * 3) * offset, 35 + i * 6 - 25 * rate);
			this.context.stroke();
		}
	},
	drawNose : function(){
		this.context.beginPath();
		this.context.fillStyle = "#000000";
		this.context.strokeStyle = "#000000";
		this.context.lineWidth = 5;
		this.context.moveTo(-8, 15);
		this.context.lineTo(8, 15);
		this.context.lineTo(0, 25);
		this.context.closePath();
		this.context.fill();
		this.context.stroke();
	},
	drawZZZ : function(){
		if(!this.sleeping || this.sleepCount >= 0){
			return;
		}
		this.context.save();
		this.context.fillStyle = "#000000";
		this.sleepped = true;
		
		if(Math.abs(this.theta) >= Math.PI / 2 && Math.abs(this.theta) <= Math.PI * 3 / 2){
			this.context.rotate(Math.PI);
		}
		for(let i = 0, length = (this.ZZZ_COUNT - this.zzzCount) / this.ZZZ_COUNT * 3; i < length; i++){
			let y = -(100 + 20 * i * Math.pow(i, 1 / 4));
			
			this.context.font = this.FONT.replace("%d", 12 * (i + 1));
			this.context.fillText("z", y * Math.sin(this.zzzTheta), y * Math.cos(this.zzzTheta));
		}
		this.context.restore();
		
		if(--this.zzzCount < 0){
			this.setSleepStatus();
		}
	}
};

$(function(){
	RENDERER.init();
});