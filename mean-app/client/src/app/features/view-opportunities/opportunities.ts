import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OpportunitiesService } from './opportunities.service';

@Component({
  selector: 'app-opportunities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './opportunities.html',
  styleUrls: ['./opportunities.css']
})
export class Opportunities implements OnInit {
  searchText: string = '';
  opportunities: any[] = [];

  constructor(private opportunitiesService: OpportunitiesService) {}

  ngOnInit() {
    this.loadOpportunities();
  }

  loadOpportunities() {
    this.opportunitiesService.getOpportunities().subscribe({
      next: (data) => {
        this.opportunities = data;
      },
      error: (err) => {
        console.error('Error fetching opportunities:', err);
      }
    });
  }

  get filteredOpportunities() {
    return this.opportunities.filter(op =>
      op.title?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
