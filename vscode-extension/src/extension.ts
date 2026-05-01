import * as vscode from 'vscode';
import { balanceOutward, balanceInward } from './commands/balance';
import { evaluateMath } from './commands/evaluate-math';
import { goToNextEditPoint, goToPreviousEditPoint } from './commands/go-to-edit-point';
import { goToTagPair } from './commands/go-to-tag-pair';
import {
    incrementNumber1, decrementNumber1,
    incrementNumber01, decrementNumber01,
    incrementNumber10, decrementNumber10,
} from './commands/inc-dec-number';
import { removeTag } from './commands/remove-tag';
import { selectNextItem, selectPreviousItem } from './commands/select-item';
import { splitJoinTag } from './commands/split-join-tag';
import { wrapWithAbbreviation } from './commands/wrap-with-abbreviation';

type SyncCmd = (editor: vscode.TextEditor) => void;
type AsyncCmd = (editor: vscode.TextEditor) => Promise<void>;

export function activate(context: vscode.ExtensionContext): void {
    const reg = (id: string, fn: SyncCmd) =>
        context.subscriptions.push(
            vscode.commands.registerTextEditorCommand(id, editor => fn(editor))
        );

    const regAsync = (id: string, fn: AsyncCmd) =>
        context.subscriptions.push(
            vscode.commands.registerTextEditorCommand(id, editor => fn(editor))
        );

    reg('emmet.balanceOutward',        balanceOutward);
    reg('emmet.balanceInward',         balanceInward);
    reg('emmet.evaluateMath',          evaluateMath);
    reg('emmet.goToNextEditPoint',     goToNextEditPoint);
    reg('emmet.goToPreviousEditPoint', goToPreviousEditPoint);
    reg('emmet.goToTagPair',           goToTagPair);
    reg('emmet.incrementNumber1',      incrementNumber1);
    reg('emmet.decrementNumber1',      decrementNumber1);
    reg('emmet.incrementNumber01',     incrementNumber01);
    reg('emmet.decrementNumber01',     decrementNumber01);
    reg('emmet.incrementNumber10',     incrementNumber10);
    reg('emmet.decrementNumber10',     decrementNumber10);
    reg('emmet.removeTag',             removeTag);
    reg('emmet.selectNextItem',        selectNextItem);
    reg('emmet.selectPreviousItem',    selectPreviousItem);
    reg('emmet.splitJoinTag',          splitJoinTag);
    regAsync('emmet.wrapWithAbbreviation', wrapWithAbbreviation);
}

export function deactivate(): void {}
