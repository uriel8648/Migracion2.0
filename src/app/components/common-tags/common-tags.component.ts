import { Component } from '@angular/core';

@Component({
  selector: 'app-common-tags',
  templateUrl: './common-tags.component.html',
  styleUrls: ['./common-tags.component.scss']
})
export class CommonTagsComponent {
  commonTags: string[] = ['Yoga', 'GYM', 'Videogames', 'Study', 'Work'];
}
