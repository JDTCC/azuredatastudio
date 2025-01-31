/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Schemas } from 'vs/base/common/network';
import { ExtUri, IExtUri } from 'vs/base/common/resources';
import { FileSystemProviderCapabilities } from 'vs/platform/files/common/files';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ExtHostFileSystemInfoShape } from 'vs/workbench/api/common/extHost.protocol';

export class ExtHostFileSystemInfo implements ExtHostFileSystemInfoShape {

	declare readonly _serviceBrand: undefined;

	private readonly _systemSchemes = new Set(Object.keys(Schemas));
	private readonly _providerInfo = new Map<string, number>();

	readonly extUri: IExtUri;

	constructor() {
		this.extUri = new ExtUri(uri => {
			const capabilities = this._providerInfo.get(uri.scheme);
			if (capabilities === undefined) {
				// default: not ignore
				return false;
			}
			if (capabilities & FileSystemProviderCapabilities.PathCaseSensitive) {
				// configured as case sensitive
				return false;
			}
			return true;
		});
	}

	$acceptProviderInfos(scheme: string, capabilities: number | null): void {
		if (capabilities === null) {
			this._providerInfo.delete(scheme);
		} else {
			this._providerInfo.set(scheme, capabilities);
		}
	}

	isFreeScheme(scheme: string): boolean {
		return !this._providerInfo.has(scheme) && !this._systemSchemes.has(scheme);
	}

	getCapabilities(scheme: string): number | undefined {
		return this._providerInfo.get(scheme);
	}
}

export interface IExtHostFileSystemInfo extends ExtHostFileSystemInfo {
	readonly extUri: IExtUri;
}
export const IExtHostFileSystemInfo = createDecorator<IExtHostFileSystemInfo>('IExtHostFileSystemInfo');
