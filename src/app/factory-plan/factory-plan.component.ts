import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, HostListener } from '@angular/core';

@Component({
  selector: 'factory-plan',
  templateUrl: './factory-plan.component.html',
  styleUrls: ['./factory-plan.component.css']
})
export class FactoryPlanComponent implements OnInit, OnChanges {
  @Input() options: FactoryPlanOptions;
  @ViewChild('factoryPlanCanvas') canvasRef: ElementRef;

  private sensitivity : number = 0.005;

  private ctx : CanvasRenderingContext2D;
  private w : number;
  private h : number;
  private col : number;
  private row : number;
  private p : number;
  private s : number;
  private r : number;
  private t : number;
  private cs : number;
  private sn : number;
  private ct : number;
  private minZoom : number;

  private panStarted : boolean = false;
  private panStartX  : number  = null;
  private panStartY  : number  = null;
  private panOffsetX : number  = null;
  private panOffsetY : number  = null;
  private panPrevOffsetX : number  = null;
  private panPrevOffsetY : number  = null;
  
  private rotStarted : boolean = false;
  private rotStartX  : number  = null;
  private rotStartY  : number  = null;
  private rotOffsetX : number  = null;
  private rotOffsetY : number  = null;
  private rotPrevOffsetX : number  = null;
  private rotPrevOffsetY : number  = null;

  private image : HTMLImageElement;

  constructor() {}

  @HostListener('document:contextmenu', ['$event'])
  onContextMenu(ev:MouseEvent) {
    return false;
  }
  
  @HostListener('document:mousedown', ['$event'])
  onMouseDown(ev:MouseEvent) {
    if (this.panStarted || this.rotStarted)
      return
    if (ev.button === 0)
    {
      this.panStartX = ev.clientX;
      this.panStartY = ev.clientY;
      this.panStarted = true;
    }
    if (ev.button === 2)
    {
      this.rotStartX = ev.clientX * this.sensitivity;
      this.rotStartY = ev.clientY * this.sensitivity;
      this.rotStarted = true;
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(ev:MouseEvent) {
    this.panStarted = false;
    this.panStartX = null;
    this.panStartY = null;
    this.panPrevOffsetX = this.panOffsetX;
    this.panPrevOffsetY = this.panOffsetY;
    
    this.rotStarted = false;
    this.rotStartX = null;
    this.rotStartY = null;
    this.rotPrevOffsetX = this.rotOffsetX;
    this.rotPrevOffsetY = this.rotOffsetY;
  }

  @HostListener('document:dblclick', ['$event'])
  onDoubleClick(ev:MouseEvent) {
    this.panStartX = null;
    this.rotOffsetY = 0;
    this.panOffsetX = 0;
    this.panOffsetY = 0;
    this.panPrevOffsetX = 0;
    this.panPrevOffsetY = 0;
    
    this.rotStarted = false;
    this.rotStartX = null;
    this.rotStartY = null;
    this.rotOffsetX = 0;
    this.rotOffsetY = 0;
    this.rotPrevOffsetX = 0;
    this.rotPrevOffsetY = 0;

    this.ngOnChanges();
  }
  
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(ev:MouseEvent) {
    if (!this.panStarted && !this.rotStarted)
      return;
      
    if (this.panStarted)
    {
      this.panOffsetX = this.panPrevOffsetX + ev.clientX - this.panStartX;
      this.panOffsetY = this.panPrevOffsetY + ev.clientY - this.panStartY;
    }

    if (this.rotStarted)
    {
      let tentativeRotOffsetX = this.rotPrevOffsetX + ev.clientX * this.sensitivity - this.rotStartX;
      let tentativeRotOffsetY = this.rotPrevOffsetY + ev.clientY * this.sensitivity - this.rotStartY;

      this.rotOffsetX = Math.min(Math.max(-Math.PI/2, tentativeRotOffsetX), Math.PI/2);
      this.rotOffsetY = Math.min(Math.max(-Math.PI/4, tentativeRotOffsetY), Math.PI/4);
    }

    this.ngOnChanges();
  }

  @HostListener('document:wheel', ['$event'])
  onScroll(ev:WheelEvent) {
    if(ev.deltaMode === 0)
      if(ev.deltaY)
      {
        let tentativeZoom = this.options.padding + 10 * Math.sign(ev.deltaY);
        this.options.padding = Math.min(Math.max(-this.minZoom, tentativeZoom), this.minZoom);
      }
    this.ngOnChanges();
  }

  public ngOnInit() : void
  {
    this.canvasRef.nativeElement.addEve
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
    this.ngOnChanges();
  }

  public ngOnChanges() : void
  {
    this.updateConfig()
    .then(()=>this.refreshPlan())
    .catch(err => console.log(err));
  }

  private updateConfig() : Promise<void>
  {
    return new Promise((resolve, reject) =>
    {
      let defaultOptions = new FactoryPlanOptions();
      this.options = this.options || new FactoryPlanOptions();
  
      this.h   = this.options.height    || defaultOptions.height;
      this.w   = this.options.width     || defaultOptions.width;
      this.col = this.options.columns   || defaultOptions.columns;
      this.row = this.options.lines     || defaultOptions.lines;
      this.p   = this.options.padding   || defaultOptions.padding;
      this.r   = this.options.XYangle   || defaultOptions.XYangle;
      this.t   = this.options.tiltAngle || defaultOptions.tiltAngle;
      this.s   = Math.min(Math.floor((this.h-2*this.p)/this.row), Math.floor((this.w-2*this.p)/this.col));
      this.minZoom = Math.min(this.h*9/20, this.w*9/20);
  
      this.canvasRef.nativeElement.height = this.h;
      this.canvasRef.nativeElement.width  = this.w;
      
      this.ctx.fillStyle = "#00000000";
      this.ctx.fillRect(0, 0, this.w, this.h);
      this.ctx.lineWidth = 0.01;

      if (this.image)
        return resolve();

      this.image = new Image(this.s, this.s);
      this.image.onload = () => resolve();
      this.image.onerror = () => reject();
      this.image.src = '../assets/BAC.png';
    });
  }

  private refreshPlan() : void
  {
    this.cs = Math.cos(this.r + this.rotOffsetX);
    this.sn = Math.sin(this.r + this.rotOffsetX);
    this.ct  = Math.cos(this.t + this.rotOffsetY);
    this.ctx.setTransform(
      this.s*this.cs,       this.s*this.sn*this.ct,
      -this.s*this.sn,      this.s*this.cs*this.ct,
      this.w/2 + this.panOffsetX, this.h/2 + this.panOffsetY
    );

    for (let x = -this.col/2; x <= this.col/2; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, -this.row/2);
      this.ctx.lineTo(x, this.row/2);
      this.ctx.stroke();
    }
    
    for (let x = -this.row/2; x <= this.row/2; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(-this.col/2, x);
      this.ctx.lineTo(this.col/2, x);
      this.ctx.stroke();
    }
    
    this.drawImage(this.image, 0, 0, 2, 2);
    this.drawImage(this.image, 0, this.row, 2, 2);
    this.drawImage(this.image, this.col, 0);
    this.drawImage(this.image, 4, 5, 2, 2);
    this.drawImage(this.image, 5, 5, 2, 2);
    this.drawImage(this.image, this.col, this.row,2,2);
  }

  private drawImage(
    image : HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap,
    column : number,
    row : number,
    colspan : number = 1,
    rowspan : number = 1
  )
  {
    this.ctx.save();
    this.ctx.translate( -this.col/2 + column, -this.row/2 + row)
    this.ctx.rotate(-this.r - this.rotOffsetX);
    this.ctx.transform(1,0,0,1/this.ct,1,1);
    this.ctx.drawImage(image, -Math.sqrt(rowspan*2), -Math.sqrt(colspan*2), colspan, rowspan);
    this.ctx.restore();
  }

}

export class FactoryPlanOptions {
  public width     : number = 1400;
  public height    : number = 900;
  public columns   : number = 9;
  public lines     : number = 9;
  public padding   : number = 100;
  public XYangle   : number = Math.PI/3;
  public tiltAngle : number = Math.PI/5;
}
