import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { AnimationController, AlertController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';
import { LensFacing, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements AfterViewInit, OnInit {
  @ViewChild('bouncingImage', { static: false }) bouncingImage!: ElementRef;

  public alertButtons = ['OK'];
  username: string = '';
  
  segment ="scan";
  scanResult: string = '';
  

  constructor(
    private animationCtrl: AnimationController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    private platform: Platform 
  ) {}

  async startScan() {
    const modal = await this.modalController.create({
      component: BarcodeScanningModalComponent,
      cssClass:'barcode-scanning-modal',
      showBackdrop: false,
      componentProps: {
        format: [],
        LensFacing: LensFacing.Back
      }
    });
    await modal.present();

    const {data } = await modal.onWillDismiss();
    if(data){
      this.scanResult = data?.barcode?.displayValue;
    }
  }
  

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { username: string };
  
    this.username = state?.username || 'Usuario desconocido';
  
    if (this.username !== 'Usuario desconocido') {
      console.log(`Usuario ingresado: ${this.username}`);
    } else {
      console.log('No se recibió ningún username');
    }
  }
  ngOnInitPlatform(): void { 
    if(this.platform.is('capacitor')){
      BarcodeScanner.isSupported().then();
      BarcodeScanner.checkPermissions().then();
      BarcodeScanner.removeAllListeners();
      
    }
  }
  

  ngAfterViewInit() {
    this.createBouncingAnimation();
  }

  createBouncingAnimation() {
    const animation = this.animationCtrl.create()
      .addElement(this.bouncingImage.nativeElement)
      .duration(1500)
      .iterations(Infinity)
      .keyframes([
        { offset: 0, transform: 'translateY(0)' },
        { offset: 0.5, transform: 'translateY(-100px)' },
        { offset: 1, transform: 'translateY(10)' }
      ]);

    animation.play();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Debes dar acceso a tu cámara',
      buttons: this.alertButtons
    });

    await alert.present();
  }

  
  logout() {
    this.router.navigate(['/home']); 
  }
  
}
