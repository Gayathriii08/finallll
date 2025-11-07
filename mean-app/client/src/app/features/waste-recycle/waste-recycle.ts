import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Login } from '../login/login';
import { Register } from '../register/register';

@Component({
  selector: 'app-waste-recycle',
  standalone: true,
  imports: [RouterModule, CommonModule, Login, Register],
  templateUrl: './waste-recycle.html',
  styleUrls: ['./waste-recycle.css']
})
export class WasteRecycle {
  showLogin = false;
  showRegister = false;
  isMenuOpen = false;  // ✅ added for mobile navbar toggle

  constructor(private router: Router) {}

  // ✅ Handles opening the login modal
  openLoginModal() {
    console.log('openLoginModal called');
    this.showLogin = true;
    this.showRegister = false;
  }

  // ✅ Handles opening the register modal
  openRegisterModal() {
    console.log('openRegisterModal called');
    this.showRegister = true;
    this.showLogin = false;
  }

  // ✅ Closes both modals
  closeModal() {
    console.log('closeModal called');
    this.showLogin = false;
    this.showRegister = false;
  }

  // ✅ Toggle navbar for mobile
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  scrollToSection(sectionId: string) {
  this.isMenuOpen = false; // close the mobile menu
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    console.warn('Section not found:', sectionId);
  }
}

}
