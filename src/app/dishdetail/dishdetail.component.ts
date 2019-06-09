import { Component, OnInit, Inject } from '@angular/core';
import { Params, ActivatedRoute} from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, style, state, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    trigger('visibility', [
      state('shown', style({
        transform: 'scale(1.0)',
        opacity: 1
      })),
      state('hidden', style({
        transform: 'scale(0.5)',
        opacity: 0
      })),
      transition('* => *', animate('0.5s ease-in-out'))
    ])
  ]
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishCopy: Dish;
  errorMess: string;
  dishIds: string[];
  prev: string;
  next: string;
  newComment = {author:'', rating:5, comment:'', date: ''};
  visibility = 'shown';

  commentForm: FormGroup;

  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required':      'Name is required.',
      'minlength':     'First Name must be at least 2 characters long.'
    },
    'comment': {
      'required':      'Comment is required.',
    }
  };

  constructor(
    private dishServie: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) {
      this.createForm();
    }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)]],
      rating: 5,
      comment: ['', Validators.required]
    });
    this.commentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const message = this.validationMessages[field];
        for (const key in control.errors) {
          if (control.errors.hasOwnProperty(key)) {
            this.formErrors[field] = message[key] + ' ';
          }
        }
      }
    }
  }

  ngOnInit() {
    this.dishServie.getDishIds().subscribe(dishIds => this.dishIds = dishIds,
        errormess => this.errorMess = errormess);
    this.route.params
      .pipe(switchMap((params: Params) => {
        this.visibility = 'hidden';
        return this.dishServie.getDish(params['id'])}))
      .subscribe(dish => {
        this.dish = dish;
        this.dishCopy = dish;
        this.setPrevNext(dish.id);
        this.visibility = 'shown'; });
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds[dishId];
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit() {
    var now = new Date();
    this.newComment.date = now.toISOString();
    this.dishCopy.comments.push(this.newComment);
    this.dishServie.putDish(this.dishCopy)
      .subscribe(dish => {
        this.dish = dish;
        this.dishCopy = dish;
      },
      errormes => { this.dish = null; this.dishCopy = null; this.errorMess = errormes});
    this.newComment = {author:'', rating:5, comment:'', date: ''};
  }
}
