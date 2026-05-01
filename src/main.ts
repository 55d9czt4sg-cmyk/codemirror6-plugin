import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';

import {
    abbreviationTracker, expandAbbreviation,
    enterAbbreviationMode, balanceOutward, toggleComment, evaluateMath,
    goToNextEditPoint, goToPreviousEditPoint, goToTagPair, incrementNumber1, decrementNumber1,
    removeTag, selectNextItem, selectPreviousItem, splitJoinTag, wrapWithAbbreviation
} from './plugin';

const text = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>User Registration</title>
    <style>
      body {
        font-family: sans-serif;
        max-width: 480px;
        margin: 2rem auto;
        padding: 0 1rem;
      }
      .form-group {
        margin-bottom: 1.25rem;
      }
      label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.35rem;
      }
      input {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
        box-sizing: border-box;
      }
      input:invalid:not(:placeholder-shown) {
        border-color: #e53e3e;
      }
      input:valid:not(:placeholder-shown) {
        border-color: #38a169;
      }
      .hint {
        font-size: 0.8rem;
        color: #666;
        margin-top: 0.25rem;
      }
      button[type="submit"] {
        width: 100%;
        padding: 0.65rem;
        background: #3182ce;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
      }
      button[type="submit"]:hover {
        background: #2b6cb0;
      }
    </style>
  </head>
  <body>
    <h1>Create an account</h1>
    <form id="registration-form" novalidate>
      <div class="form-group">
        <label for="full-name">Full name</label>
        <input
          type="text"
          id="full-name"
          name="fullName"
          placeholder="Jane Smith"
          minlength="2"
          maxlength="80"
          required
          autocomplete="name"
        />
      </div>
      <div class="form-group">
        <label for="email">Email address</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="jane@example.com"
          required
          autocomplete="email"
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="••••••••"
          minlength="8"
          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$"
          required
          autocomplete="new-password"
        />
        <p class="hint">At least 8 characters with one uppercase letter and one number.</p>
      </div>
      <div class="form-group">
        <label for="confirm-password">Confirm password</label>
        <input
          type="password"
          id="confirm-password"
          name="confirmPassword"
          placeholder="••••••••"
          required
          autocomplete="new-password"
        />
      </div>
      <div class="form-group">
        <label for="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="janesmith42"
          pattern="^[a-zA-Z0-9_]{3,20}$"
          minlength="3"
          maxlength="20"
          required
          autocomplete="username"
        />
        <p class="hint">3–20 characters: letters, numbers, and underscores only.</p>
      </div>
      <button type="submit">Create account</button>
    </form>
    <script>
      const form = document.getElementById('registration-form');
      const password = document.getElementById('password');
      const confirm = document.getElementById('confirm-password');

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (password.value !== confirm.value) {
          confirm.setCustomValidity('Passwords do not match.');
        } else {
          confirm.setCustomValidity('');
        }
        if (!form.checkValidity()) {
          form.querySelectorAll(':invalid')[0].focus();
          return;
        }
        console.log('Registration submitted:', Object.fromEntries(new FormData(form)));
      });

      confirm.addEventListener('input', () => {
        confirm.setCustomValidity(
          confirm.value && confirm.value !== password.value
            ? 'Passwords do not match.'
            : ''
        );
      });
    </script>
  </body>
</html>`;

new EditorView({
    doc: text,
    extensions: [
        basicSetup,
        html(),
        Prec.high(abbreviationTracker({
            autocompleteTab: ['stylesheet'],
            config: {
                markup: {
                    snippets: {
                        'foo': 'ul.foo>li.bar+li.baz'
                    }
                },
                stylesheet: {
                    options: {
                        'stylesheet.strictMatch': true
                    }
                },
            }
        })),
        wrapWithAbbreviation(),
        keymap.of([{
            key: 'Cmd-e',
            run: expandAbbreviation
        },{
            key: 'Cmd-Shift-e',
            run: enterAbbreviationMode
        }, {
            key: 'Cmd-Shift-d',
            run: balanceOutward
        }, {
            key: 'Ctrl-/',
            run: toggleComment
        }, {
            key: 'Ctrl-y',
            run: evaluateMath
        }, {
            key: 'Ctrl-Alt-ArrowLeft',
            run: goToPreviousEditPoint
        }, {
            key: 'Ctrl-Alt-ArrowRight',
            run: goToNextEditPoint
        }, {
            key: 'Ctrl-g',
            run: goToTagPair
        }, {
            key: 'Ctrl-Alt-ArrowUp',
            run: incrementNumber1
        }, {
            key: 'Ctrl-Alt-ArrowDown',
            run: decrementNumber1
        }, {
            key: 'Ctrl-\'',
            run: removeTag
        }, {
            key: 'Ctrl-Shift-\'',
            run: splitJoinTag
        }, {
            key: 'Ctrl-.',
            run: selectNextItem
        }, {
            key: 'Ctrl-,',
            run: selectPreviousItem
        }]),
    ],
    parent: document.querySelector<HTMLDivElement>('#app')!
});
