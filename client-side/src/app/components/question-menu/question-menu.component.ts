import { Component, OnInit } from '@angular/core';
import { QuestionMenuService } from './question-menu.service';
import { SurveysService } from "../../services/surveys.service";

@Component({
  selector: 'survey-question-menu',
  templateUrl: './question-menu.component.html',
  styleUrls: ['./question-menu.component.scss'],
  providers: [QuestionMenuService]
})
export class QuestionMenuComponent implements OnInit {
  get menuItems() {
    return this._questionMenuService.menuItems;
  }

  constructor(
    private _questionMenuService: QuestionMenuService,
    private _surveysService: SurveysService) { }

  ngOnInit(): void {
  }

  onAddQuestionClicked(item) {        
    this._surveysService.addQuestion(item.key);
}

}
