import React, { useState, forwardRef, useRef, useEffect } from 'react';
import classnames from 'classnames';
import filter from 'lodash/filter';
import cloneDeep from 'lodash/cloneDeep';
import { useDrop } from 'react-dnd';
import { IconChevronRight, IconDots } from '@tabler/icons';
import Dropdown from 'components/Dropdown';
import { collectionClicked } from 'providers/ReduxStore/slices/collections';
import { moveItemToRootOfCollection } from 'providers/ReduxStore/slices/collections/actions';
import { useDispatch } from 'react-redux';
import NewRequest from 'components/Sidebar/NewRequest';
import NewFolder from 'components/Sidebar/NewFolder';
import CollectionItem from './CollectionItem';
import RemoveCollection from './RemoveCollection';
import RunCollectionItem from './CollectionItem/RunCollectionItem';
import { doesCollectionHaveItemsMatchingSearchText } from 'utils/collections/search';
import { isItemAFolder, isItemARequest, transformCollectionToSaveToIdb } from 'utils/collections';
import exportCollection from 'utils/collections/export';

import RenameCollection from './RenameCollection';
import StyledWrapper from './StyledWrapper';

const Collection = ({ collection, searchText }) => {
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showRenameCollectionModal, setShowRenameCollectionModal] = useState(false);
  const [showRemoveCollectionModal, setShowRemoveCollectionModal] = useState(false);
  const [showRunCollectionModal, setShowRunCollectionModal] = useState(false);
  const [collectionIsCollapsed, setCollectionIsCollapsed] = useState(collection.collapsed);
  const dispatch = useDispatch();

  const menuDropdownTippyRef = useRef();
  const onMenuDropdownCreate = (ref) => (menuDropdownTippyRef.current = ref);
  const MenuIcon = forwardRef((props, ref) => {
    return (
      <div ref={ref} className="pr-2">
        <IconDots size={22} />
      </div>
    );
  });

  useEffect(() => {
    if (searchText && searchText.length) {
      setCollectionIsCollapsed(false);
    } else {
      setCollectionIsCollapsed(collection.collapsed);
    }
  }, [searchText, collection]);

  const iconClassName = classnames({
    'rotate-90': !collectionIsCollapsed
  });

  const handleClick = (event) => {
    dispatch(collectionClicked(collection.uid));
  };

  const handleExportClick = () => {
    const collectionCopy = cloneDeep(collection);
    exportCollection(transformCollectionToSaveToIdb(collectionCopy));
  };

  const [{ isOver }, drop] = useDrop({
    accept: `COLLECTION_ITEM_${collection.uid}`,
    drop: (draggedItem) => {
      dispatch(moveItemToRootOfCollection(collection.uid, draggedItem.uid));
    },
    canDrop: (draggedItem) => {
      // todo need to make sure that draggedItem belongs to the collection
      return true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  if (searchText && searchText.length) {
    if (!doesCollectionHaveItemsMatchingSearchText(collection, searchText)) {
      return null;
    }
  }

  // we need to sort request items by seq property
  const sortRequestItems = (items = []) => {
    return items.sort((a, b) => a.seq - b.seq);
  };

  // we need to sort folder items by name alphabetically
  const sortFolderItems = (items = []) => {
    return items.sort((a, b) => a.name.localeCompare(b.name));
  };

  const requestItems = sortRequestItems(filter(collection.items, (i) => isItemARequest(i)));
  const folderItems = sortFolderItems(filter(collection.items, (i) => isItemAFolder(i)));

  return (
    <StyledWrapper className="flex flex-col">
      {showNewRequestModal && <NewRequest collection={collection} onClose={() => setShowNewRequestModal(false)} />}
      {showNewFolderModal && <NewFolder collection={collection} onClose={() => setShowNewFolderModal(false)} />}
      {showRenameCollectionModal && (
        <RenameCollection collection={collection} onClose={() => setShowRenameCollectionModal(false)} />
      )}
      {showRemoveCollectionModal && (
        <RemoveCollection collection={collection} onClose={() => setShowRemoveCollectionModal(false)} />
      )}
      {showRunCollectionModal && (
        <RunCollectionItem collection={collection} onClose={() => setShowRunCollectionModal(false)} />
      )}
      <div className="flex py-1 collection-name items-center" ref={drop}>
        <div className="flex flex-grow items-center overflow-hidden" onClick={handleClick}>
          <IconChevronRight
            size={16}
            strokeWidth={2}
            className={iconClassName}
            style={{ width: 16, minWidth: 16, color: 'rgb(160 160 160)' }}
          />
          <div className="ml-1" id="sidebar-collection-name">
            {collection.name}
          </div>
        </div>
        <div className="collection-actions">
          <Dropdown onCreate={onMenuDropdownCreate} icon={<MenuIcon />} placement="bottom-start">
            <div
              className="dropdown-item"
              onClick={(e) => {
                menuDropdownTippyRef.current.hide();
                setShowNewRequestModal(true);
              }}
            >
              New Request
            </div>
            <div
              className="dropdown-item"
              onClick={(e) => {
                menuDropdownTippyRef.current.hide();
                setShowNewFolderModal(true);
              }}
            >
              New Folder
            </div>
            <div
              className="dropdown-item"
              onClick={(e) => {
                menuDropdownTippyRef.current.hide();
                setShowRunCollectionModal(true);
              }}
            >
              Run
            </div>
            <div
              className="dropdown-item"
              onClick={(e) => {
                menuDropdownTippyRef.current.hide();
                setShowRenameCollectionModal(true);
              }}
            >
              Rename
            </div>
            <div
              className="dropdown-item"
              onClick={(e) => {
                menuDropdownTippyRef.current.hide();
                handleExportClick(true);
              }}
            >
              Export
            </div>
            <div
              className="dropdown-item"
              onClick={(e) => {
                menuDropdownTippyRef.current.hide();
                setShowRemoveCollectionModal(true);
              }}
            >
              Remove
            </div>
          </Dropdown>
        </div>
      </div>

      <div>
        {!collectionIsCollapsed ? (
          <div>
            {folderItems && folderItems.length
              ? folderItems.map((i) => {
                  return <CollectionItem key={i.uid} item={i} collection={collection} searchText={searchText} />;
                })
              : null}
            {requestItems && requestItems.length
              ? requestItems.map((i) => {
                  return <CollectionItem key={i.uid} item={i} collection={collection} searchText={searchText} />;
                })
              : null}
          </div>
        ) : null}
      </div>
    </StyledWrapper>
  );
};

export default Collection;
